import { row, toggle, setHTML } from '../../ui/ui.js';
import { icon } from '../../../core/icons.js';
import { store, update } from '../../../state.js';

// Connection details, live traffic and VPN. Real shell: NetworkManager + sysfs counters.
const fmtRate = mb => (mb >= 1 ? mb.toFixed(1) + ' MB/s' : Math.round(mb * 1000) + ' KB/s');
const spark = key => `<svg class="tl-line" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline data-line="${key}"/></svg>`;
const points = list => {
  const max = Math.max(1, ...list);
  return list.map((v, i) => `${(i / (list.length - 1) * 100).toFixed(1)},${(19 - v / max * 17).toFixed(1)}`).join(' ');
};

export default {
  id: 'network',
  label: 'Rede',
  icon: 'network',

  quick: () => ({ icon: 'network', text: 'Rede', tone: 'ok' }),

  render() {
    const n = store.get().network;
    return `
      <div class="status"><span class="big">${icon('network')}</span>
        <span class="grow"><b>${n.kind} conectada</b><div class="meta">${n.iface} · ${n.speed} · internet ok</div></span></div>
      <dl class="card"><dt>IP</dt><dd>${n.ip}</dd><dt>Gateway</dt><dd>${n.gateway}</dd><dt>Rede Docker</dt><dd>${n.dockerNet}</dd></dl>
      <div class="traffic">
        <div>${icon('arrow-down')} Download<b data-rate="down"></b>${spark('down')}</div>
        <div>${icon('arrow-up')} Upload<b data-rate="up"></b>${spark('up')}</div>
      </div>
      <div class="sec">Conexões</div>
      <div data-vpn></div>
      ${row({ icon: 'copy', title: 'Copiar IP', trailing: '<span class="meta" data-copied></span>', attrs: 'data-copy' })}`;
  },

  update(root, { network: n }) {
    for (const key of ['down', 'up']) {
      root.querySelector(`[data-rate="${key}"]`).textContent = fmtRate(n[key].at(-1));
      root.querySelector(`[data-line="${key}"]`).setAttribute('points', points(n[key]));
    }
    const vpn = row({ icon: 'shield', title: 'VPN', meta: n.vpn, trailing: toggle(n.vpnOn) });
    setHTML(root.querySelector('[data-vpn]'), vpn);
  },

  click(target, root) {
    if (target.closest('[data-vpn]')) update('network', n => ({ vpnOn: !n.vpnOn }));
    if (target.closest('[data-copy]')) {
      try { navigator.clipboard.writeText(store.get().network.ip); } catch {}
      const note = root.querySelector('[data-copied]');
      note.textContent = 'Copiado!';
      setTimeout(() => { note.textContent = ''; }, 1500);
    }
  },
};
