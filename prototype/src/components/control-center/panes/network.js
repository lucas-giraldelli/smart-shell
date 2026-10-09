import { row, toggle, setHTML } from '../../ui/ui.js';
import { icon } from '../../../core/icons.js';
import { store, update } from '../../../state.js';
import { t } from '../../../i18n/index.js';

// Connection details, live traffic and VPN. Real shell: NetworkManager + sysfs counters.
const fmtRate = mb => (mb >= 1 ? mb.toFixed(1) + ' MB/s' : Math.round(mb * 1000) + ' KB/s');
const spark = key => `<svg class="tl-line" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline data-line="${key}"/></svg>`;
const points = list => {
  const max = Math.max(1, ...list);
  return list.map((v, i) => `${(i / (list.length - 1) * 100).toFixed(1)},${(19 - v / max * 17).toFixed(1)}`).join(' ');
};

export default {
  id: 'network',
  get label() { return t('network.label'); },
  icon: 'network',

  quickWidth: '4.7ch', // fits "VPN…"
  // a VPN takes over the item: shield + "VPN", pulsing while it connects
  quick: ({ network: n }) => {
    if (!n.online) return { icon: 'network', text: 'OFF', status: 'crit' };
    if (n.vpnState === 'on') return { icon: 'shield-check', text: 'VPN', status: 'ok', colorText: true, tip: t('network.vpnOnTip', { server: n.vpnServer }) };
    if (n.vpnState === 'authenticating' || n.vpnState === 'connecting') return { icon: 'shield', text: 'VPN…', status: 'warn', pulse: true, tip: t(`network.vpnStates.${n.vpnState}`) };
    return { icon: 'network', text: 'ON', status: 'ok' };
  },

  render() {
    const n = store.get().network;
    return `
      <div class="status" data-online></div>
      <dl class="card"><dt>${t('network.ip')}</dt><dd>${n.ip}</dd><dt>${t('network.gateway')}</dt><dd>${n.gateway}</dd><dt>${t('network.dockerNet')}</dt><dd>${n.dockerNet}</dd></dl>
      <div class="traffic">
        <div>${icon('arrow-down')} ${t('network.download')}<b data-rate="down"></b>${spark('down')}</div>
        <div>${icon('arrow-up')} ${t('network.upload')}<b data-rate="up"></b>${spark('up')}</div>
      </div>
      <div class="sec">${t('network.connections')}</div>
      <div data-vpn></div>
      ${row({ icon: 'copy', title: t('network.copyIp'), trailing: '<span class="meta" data-copied></span>', attrs: 'data-copy' })}`;
  },

  update(root, { network: n }) {
    const online = root.querySelector('[data-online]');
    online.dataset.status = n.online ? 'ok' : 'crit';
    setHTML(online, `<span class="big">${icon('network')}</span><span class="grow">
      <b>${n.online ? t('network.connected', { kind: n.kind }) : t('network.offline')}</b>
      <div class="meta">${n.iface} · ${n.speed} · ${t(n.online ? 'network.internetOk' : 'network.noPing')}</div></span>`);
    for (const key of ['down', 'up']) {
      root.querySelector(`[data-rate="${key}"]`).textContent = fmtRate(n[key].at(-1));
      root.querySelector(`[data-line="${key}"]`).setAttribute('points', points(n[key]));
    }
    // VPN: openvpn3 or NetworkManager; the switch follows the session
    const profile = n.vpnProfiles[0];
    const busy = n.vpnState === 'authenticating' || n.vpnState === 'connecting';
    const vpn = row({
      icon: n.vpnState === 'on' ? 'shield-check' : 'shield', title: profile ? `${t('network.vpn')} · ${profile}` : t('network.vpn'),
      meta: profile ? `<span class="vpn-${n.vpnState}">${t(`network.vpnStates.${n.vpnState}`, { server: n.vpnServer })}</span>` : '—',
      trailing: toggle(n.vpnState === 'on' || busy),
    });
    setHTML(root.querySelector('[data-vpn]'), vpn);
  },

  click(target, root) {
    // the mock's openvpn3: approval in the browser takes a moment, then it connects
    if (target.closest('[data-vpn]')) {
      const off = ['off', 'error'].includes(store.get().network.vpnState);
      update('network', { vpnState: off ? 'authenticating' : 'off' });
      if (off) setTimeout(() => { if (store.get().network.vpnState === 'authenticating') update('network', { vpnState: 'on' }); }, 2500);
    }
    if (target.closest('[data-copy]')) {
      try { navigator.clipboard.writeText(store.get().network.ip); } catch {}
      const note = root.querySelector('[data-copied]');
      note.textContent = t('common.copied');
      setTimeout(() => { note.textContent = ''; }, 1500);
    }
  },
};
