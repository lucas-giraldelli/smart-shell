import { icon } from '../../../core/icons.js';
import { closePopover } from '../../../core/popover.js';
import { update } from '../../../state.js';
import { t, formatNumber } from '../../../i18n/index.js';

// Containers with start/stop. Real shell: `docker ps -a` / the Docker socket.
// Status follows waybar's docker-status.sh: service down = crit, any container
// paused / restarting / exited with an error = warn, otherwise ok.
const counts = cs => ({ up: cs.filter(c => c.state === 'running').length, total: cs.length });

// memory of running containers, e.g. "910 MiB" / "1,4 GiB"
const memOf = c => (c.state === 'running' ? c.memMiB : 0);
export const fmtMem = mib => (mib < 1024 ? `${Math.round(mib)} MiB` : `${formatNumber(mib / 1024)} GiB`);
const totalMem = docker => (docker.running ? docker.containers.reduce((sum, c) => sum + memOf(c), 0) : 0);
const isBad = c => c.state === 'paused' || c.state === 'restarting' || (c.state === 'exited' && c.exitCode !== 0);

export function dockerStatus(docker) {
  if (!docker.running) return 'crit';
  return docker.containers.some(isBad) ? 'warn' : 'ok';
}

function containerStatus(c) {
  if (c.state === 'running') return 'ok';
  return isBad(c) ? (c.state === 'exited' ? 'crit' : 'warn') : 'off';
}

function describe(c) {
  if (c.state === 'exited') return c.exitCode ? t('docker.exitedError', { code: c.exitCode }) : t('common.stopped');
  return t(`docker.${c.state}`);
}

export default {
  id: 'docker',
  get label() { return t('docker.label'); },
  icon: 'container',
  requires: 'docker',

  // the quick item shows what Docker costs right now: its memory
  quickWidth: '7ch',
  quick: ({ docker }) => ({
    icon: 'container', text: docker.running ? fmtMem(totalMem(docker)) : t('common.stopped'), status: dockerStatus(docker),
  }),

  render: () => `
    <div class="dk-head"><span data-summary></span><button class="btn-s" data-lazy>${icon('external-link')}lazydocker</button></div>
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
    root.querySelector('.dk-list').innerHTML = docker.containers.map((c, i) => {
      const running = c.state === 'running';
      return `
      <div class="ct" data-status="${docker.running ? containerStatus(c) : 'off'}"><span class="led"></span>
        <span class="grow">${c.name}<div class="meta">${docker.running ? describe(c) : '—'}</div></span>
        ${docker.running && running ? `<span class="mem">${fmtMem(c.memMiB)}</span>` : ''}
        ${running && c.healthy ? '<span class="tag">healthy</span>' : ''}
        <button class="ib" data-ct="${i}" title="${t(running ? 'docker.stop' : 'docker.start')}">${icon(running ? 'square' : 'play')}</button>
      </div>`;
    }).join('');
  },

  click(target) {
    const ct = target.closest('[data-ct]');
    if (ct) {
      const i = +ct.dataset.ct;
      // stopping by hand is a clean exit (code 0), so it doesn't raise a warning
      update('docker', d => ({
        containers: d.containers.map((c, j) => (j === i ? { ...c, state: c.state === 'running' ? 'exited' : 'running', exitCode: 0 } : c)),
      }));
    }
    if (target.closest('[data-lazy]')) closePopover(); // launches lazydocker in the real shell
  },
};
