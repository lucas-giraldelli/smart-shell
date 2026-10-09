import { icon } from '../../../core/icons.js';
import { closePopover } from '../../../core/popover.js';
import { update } from '../../../state.js';

// Containers with start/stop. Real shell: `docker ps -a` / the Docker socket.
const counts = cs => ({ up: cs.filter(c => c.up).length, total: cs.length });

export default {
  id: 'docker',
  label: 'Docker',
  icon: 'container',
  requires: 'docker',

  quick: ({ docker }) => {
    const { up, total } = counts(docker.containers);
    return { icon: 'container', text: `${up}/${total}`, tone: up === total ? 'ok' : 'warn' };
  },

  render: () => `
    <div class="dk-head"><span data-summary></span><button class="btn-s" data-lazy>${icon('external-link')}lazydocker</button></div>
    <div class="dk-list"></div>`,

  update(root, { docker }) {
    if (root.list === docker.containers) return;
    root.list = docker.containers;
    const { up, total } = counts(docker.containers);
    root.querySelector('[data-summary]').textContent = `${total} containers · ${up} rodando`;
    root.querySelector('.dk-list').innerHTML = docker.containers.map((c, i) => `
      <div class="ct${c.up ? '' : ' stopped'}"><span class="led"></span>
        <span class="grow">${c.name}<div class="meta">${c.up ? 'Up 4 days' : 'Parado'}</div></span>
        ${c.up && c.healthy ? '<span class="tag">healthy</span>' : ''}
        <button class="ib" data-ct="${i}" title="${c.up ? 'Parar' : 'Iniciar'}">${icon(c.up ? 'square' : 'play')}</button>
      </div>`).join('');
  },

  click(target) {
    const ct = target.closest('[data-ct]');
    if (ct) {
      const i = +ct.dataset.ct;
      update('docker', d => ({ containers: d.containers.map((c, j) => (j === i ? { ...c, up: !c.up } : c)) }));
    }
    if (target.closest('[data-lazy]')) closePopover(); // launches lazydocker in the real shell
  },
};
