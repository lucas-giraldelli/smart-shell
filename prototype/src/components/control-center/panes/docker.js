import { icon } from '../../../core/icons.js';
import { closePopover } from '../../../core/popover.js';
import { update } from '../../../state.js';

// Containers with start/stop. Real shell: `docker ps -a` / the Docker socket.
// Status follows waybar's docker-status.sh: service down = crit, any container
// paused / restarting / exited with an error = warn, otherwise ok.
const counts = cs => ({ up: cs.filter(c => c.state === 'running').length, total: cs.length });

// memory of running containers, e.g. "910 MiB" / "1,4 GiB"
const memOf = c => (c.state === 'running' ? c.memMiB : 0);
export const fmtMem = mib => (mib < 1024 ? `${Math.round(mib)} MiB` : `${(mib / 1024).toFixed(1).replace('.', ',')} GiB`);
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

const STATE_TEXT = { running: 'Up 4 days', paused: 'Pausado', restarting: 'Reiniciando…' };
const describe = c => STATE_TEXT[c.state] ?? (c.exitCode ? `Saiu com erro (${c.exitCode})` : 'Parado');

export default {
  id: 'docker',
  label: 'Docker',
  icon: 'container',
  requires: 'docker',

  // the quick item shows what Docker costs right now: its memory
  quick: ({ docker }) => ({
    icon: 'container', text: docker.running ? fmtMem(totalMem(docker)) : 'Parado', status: dockerStatus(docker),
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
      ? `<span class="led"></span>${up} de ${total} rodando · ${fmtMem(totalMem(docker))}`
      : '<span class="led"></span>Serviço do Docker parado';
    root.querySelector('.dk-list').innerHTML = docker.containers.map((c, i) => {
      const running = c.state === 'running';
      return `
      <div class="ct" data-status="${docker.running ? containerStatus(c) : 'off'}"><span class="led"></span>
        <span class="grow">${c.name}<div class="meta">${docker.running ? describe(c) : '—'}</div></span>
        ${docker.running && running ? `<span class="mem">${fmtMem(c.memMiB)}</span>` : ''}
        ${running && c.healthy ? '<span class="tag">healthy</span>' : ''}
        <button class="ib" data-ct="${i}" title="${running ? 'Parar' : 'Iniciar'}">${icon(running ? 'square' : 'play')}</button>
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
