import { icon } from '../../../core/icons.js';
import { closePopover } from '../../../core/popover.js';
import { update } from '../../../state.js';
import { config } from '../../../data/config.js';
import { t, formatNumber } from '../../../i18n/index.js';

// Containers with start/stop. Real shell: `docker ps -a` / the Docker socket.
// Only real failures are flagged; stopping a stack on purpose is not one:
//   crit  a container restarting or running unhealthy, one exited with an error while
//         the rest of its compose project still runs, or a non-compose one that
//         exited with an error and has a restart policy
//   off   the Docker service is down, or nothing is running
//   ok    everything else (stopped stacks, paused containers)
const counts = cs => ({ up: cs.filter(c => c.state === 'running').length, total: cs.length });

// memory of running containers, e.g. "910 MiB" / "1,4 GiB"
const memOf = c => (c.state === 'running' ? c.memMiB : 0);
export const fmtMem = mib => (mib < 1024 ? `${Math.round(mib)} MiB` : `${formatNumber(mib / 1024)} GiB`);
const totalMem = docker => (docker.running ? docker.containers.reduce((sum, c) => sum + memOf(c), 0) : 0);
// a crash inside a live stack, not the stack being shut down
const projectLive = (cs, c) => cs.some(o => o.project === c.project && o.state === 'running');
const crashed = (c, cs) => c.state === 'exited' && c.exitCode !== 0
  && (c.project ? projectLive(cs, c) : c.restart !== 'no');
// a stopped container keeps its last health check, so only a running one counts
const unhealthy = c => c.state === 'running' && c.health === 'unhealthy';
const isFailure = (c, cs) => c.state === 'restarting' || unhealthy(c) || crashed(c, cs);

export function dockerStatus(docker) {
  if (!docker.running) return 'off';
  const cs = docker.containers;
  if (cs.some(c => isFailure(c, cs))) return 'crit';
  return cs.some(c => c.state === 'running') ? 'ok' : 'off';
}

// Containers grouped by compose project, like lazydocker; the ones without a
// project go under "Other". A project is crit when one of its containers
// failed, off when none runs, ok otherwise.
export function groups(cs) {
  const byProject = new Map();
  for (const c of cs) {
    if (!byProject.has(c.project)) byProject.set(c.project, []);
    byProject.get(c.project).push(c);
  }
  // failing first, then running projects (A-Z), "Other", fully stopped ones last
  const rank = g => {
    const status = groupStatus(g, cs);
    return status === 'crit' ? 0 : !g.project ? 2 : status === 'ok' ? 1 : 3;
  };
  return [...byProject].map(([project, containers]) => ({ project, containers }))
    .sort((a, b) => rank(a) - rank(b) || a.project.localeCompare(b.project));
}
function groupStatus(group, cs) {
  if (group.containers.some(c => isFailure(c, cs))) return 'crit';
  return group.containers.some(c => c.state === 'running') ? 'ok' : 'off';
}

// which groups are open: the user's choice, else open only when failing
const expanded = new Map();
const isExpanded = (project, status) => expanded.get(project) ?? status === 'crit';

function containerStatus(c, cs) {
  if (isFailure(c, cs)) return 'crit';
  return c.state === 'running' ? 'ok' : 'off';
}

function describe(c, cs) {
  if (c.state === 'exited') return crashed(c, cs) ? t('docker.exitedError', { code: c.exitCode }) : t('common.stopped');
  if (unhealthy(c)) return t('docker.unhealthy');
  return t(`docker.${c.state}`);
}

export default {
  id: 'docker',
  get label() { return t('docker.label'); },
  icon: 'container',
  requires: 'docker',

  // the quick item shows what Docker costs right now: its memory
  quickWidth: '7.3ch', // fits "1023 MiB"
  quick: ({ docker }) => ({
    icon: 'container', text: docker.running ? fmtMem(totalMem(docker)) : t('common.stopped'), status: dockerStatus(docker),
  }),

  render: () => `
    <div class="dk-head"><span data-summary></span><button class="btn-s" data-lazy title="${config.commands.docker}">${icon('external-link')}lazydocker</button></div>
    <div class="dk-list"></div>`,

  update(root, { docker }) {
    if (root.data === docker) return;
    root.data = docker;
    const { up, total } = counts(docker.containers);
    const summary = root.querySelector('[data-summary]');
    summary.dataset.status = dockerStatus(docker);
    summary.innerHTML = docker.running
      ? `<span class="led"></span>${t('docker.summary', { up, total, mem: fmtMem(totalMem(docker)) })}`
      : `<span class="led"></span>${t('docker.serviceDown')}`;
    const cs = docker.containers;
    const row = c => {
      const running = c.state === 'running';
      return `
      <div class="ct" data-status="${docker.running ? containerStatus(c, cs) : 'off'}"><span class="led"></span>
        <span class="grow">${c.name}<div class="meta">${docker.running ? describe(c, cs) : '—'}</div></span>
        ${docker.running && running ? `<span class="mem">${fmtMem(c.memMiB)}</span>` : ''}
        ${running && c.health === 'healthy' ? '<span class="tag">healthy</span>' : ''}
        <button class="ib" data-ct="${cs.indexOf(c)}" title="${t(running ? 'docker.stop' : 'docker.start')}">${icon(running ? 'square' : 'play')}</button>
      </div>`;
    };
    root.querySelector('.dk-list').innerHTML = groups(cs).map(g => {
      const status = docker.running ? groupStatus(g, cs) : 'off';
      const { up, total } = counts(g.containers);
      const mem = g.containers.reduce((sum, c) => sum + memOf(c), 0);
      return `
      <div class="dk-group${isExpanded(g.project, status) ? ' open' : ''}" data-group="${g.project}">
        <div class="dk-proj" data-status="${status}">${icon('chevron-right', 'dk-chev')}<span class="led"></span>
          <span class="grow">${g.project || t('docker.other')}</span>
          ${docker.running && up ? `<span class="mem">${fmtMem(mem)}</span>` : ''}
          <span class="dk-count">${up}/${total}</span>
        </div>
        <div class="dk-body"><div>${g.containers.map(row).join('')}</div></div>
      </div>`;
    }).join('');
  },

  click(target) {
    const proj = target.closest('.dk-proj');
    if (proj) {
      // toggled in place, so the body animates open / shut
      const group = proj.parentElement;
      expanded.set(group.dataset.group, group.classList.toggle('open'));
      return;
    }
    const ct = target.closest('[data-ct]');
    if (ct) {
      const i = +ct.dataset.ct;
      // stopping by hand is a clean exit (code 0), so it never counts as a failure
      update('docker', d => ({
        containers: d.containers.map((c, j) => (j === i ? { ...c, state: c.state === 'running' ? 'exited' : 'running', exitCode: 0 } : c)),
      }));
    }
    if (target.closest('[data-lazy]')) closePopover(); // runs config.commands.docker in the real shell
  },
};
