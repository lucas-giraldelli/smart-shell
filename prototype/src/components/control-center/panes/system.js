import { icon } from '../../../core/icons.js';
import { setHTML } from '../../ui/ui.js';
import { update as setState } from '../../../state.js';
import { fmtMem } from './docker.js';
import { closePopover } from '../../../core/popover.js';
import { config } from '../../../data/config.js';
import { t, formatNumber, dateFormat, formatTime } from '../../../i18n/index.js';

// CPU and memory: two items in the quick tile (free RAM, CPU load + die
// temperature) and one tab with the details. Real shell: /proc/stat,
// /proc/meminfo, the k10temp Tccd1 sensor and `ps` for the top memory users.
// config.thresholds (shared with the pets)
export function memStatus(s) {
  const m = config.thresholds.memFreeGiB;
  return s.memFree < m.crit ? 'crit' : s.memFree < m.warn ? 'warn' : 'ok';
}
export function tempStatus(s) {
  const { warn, crit, roomTemp } = config.thresholds.tempC;
  const base = roomTemp ?? 0;
  return s.temp >= base + crit ? 'crit' : s.temp >= base + warn ? 'warn' : 'ok';
}
// "4 d 16 h" / "3 h 12 min" / "8 min"
function uptime(since) {
  const min = Math.floor((Date.now() - since) / 60000);
  const d = Math.floor(min / 1440), h = Math.floor(min / 60) % 24, m = min % 60;
  if (d) return t('system.uptimeDays', { d, h });
  if (h) return t('system.uptimeHours', { h, m });
  return t('system.uptimeMinutes', { m });
}
// Processes the shell must never offer to kill: the session itself.
export const isProtected = name => /^(Hyprland|qs|quickshell|systemd.*|\(sd-pam\)|pipewire.*|wireplumber|dbus.*|Xwayland|xdg-.*portal.*|fish|bash|zsh|sh|login|sddm.*)$/i.test(name);

// The kill button per process group: idle -> armed (3 s to confirm) -> term
// (SIGTERM sent) -> force (still alive after 3 s: SIGKILL on the next click).
const killState = new Map();
const KILL_MS = 3000;
const rerender = () => setState('system', s => ({ top: s.top.slice() }));
function setKill(name, state) {
  clearTimeout(killState.get(name)?.timer);
  if (!state) { killState.delete(name); return rerender(); }
  const timer = state === 'armed' ? setTimeout(() => setKill(name, null), KILL_MS) : null;
  killState.set(name, { state, timer });
  rerender();
}
// the mock's processes: SIGTERM ends them unless stubborn, SIGKILL always
function signal(name, sig) {
  const gone = sig === 'KILL' || !procOf(name).stubborn;
  if (gone) { killState.delete(name); setState('system', s => ({ top: s.top.filter(p => p.name !== name) })); return; }
  setKill(name, 'term');
  setTimeout(() => setKill(name, 'force'), KILL_MS);
}
let current = [];
const procOf = name => current.find(p => p.name === name) ?? {};

const points = list => list.map((v, i) => `${(i / (list.length - 1) * 100).toFixed(1)},${(19 - v / 100 * 17).toFixed(1)}`).join(' ');

export default {
  id: 'system',
  get label() { return t('system.label'); },
  icon: 'cpu',

  // one pane, two mini items
  quick: ({ system: s }) => [
    { icon: 'memory-stick', text: `${Math.round(s.memFree)} GiB`, width: '6ch', status: memStatus(s) === 'ok' ? null : memStatus(s) },
    // load and temperature left-aligned in fixed slots exactly as wide as "100%"
    // and "100°" (tabular 11.5px Inter), 5px apart like icon and text: the
    // temperature always starts at the same x
    { icon: 'cpu', parts: [[`${Math.round(s.load)}%`, '4.55ch'], [`${s.temp}°`, '3.72ch']], width: '8.95ch', status: tempStatus(s) === 'ok' ? null : tempStatus(s) },
  ],

  render: () => `
    <div class="sys-pane">
      <div class="sys-card" data-cpu>
        <div class="sys-head">${icon('cpu')}<span class="grow">${t('system.cpu')}</span><b data-load></b></div>
        <svg class="tl-line" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline data-line="cpu"/></svg>
        <div class="meta" data-temp></div>
      </div>
      <div class="sys-card" data-mem>
        <div class="sys-head">${icon('memory-stick')}<span class="grow">${t('system.memory')}</span><b data-free></b></div>
        <div class="mem-bar"><i></i></div>
        <div class="meta" data-used></div>
      </div>
    </div>
    <div class="dk-head"><span class="uptime" data-uptime></span>
      <button class="btn-s" data-screen-off title="${t('system.screenOff')}">${icon('monitor-off')}${t('system.screen')}</button>
      <button class="btn-s" data-monitor title="${config.commands.monitor}">${icon('external-link')}btop</button></div>
    <div class="sec">${t('system.top')}</div>
    <div class="top-list"></div>`,

  update(root, { system: s }) {
    const cpu = root.querySelector('[data-cpu]'), mem = root.querySelector('[data-mem]');
    cpu.dataset.status = tempStatus(s);
    cpu.querySelector('[data-load]').textContent = `${Math.round(s.load)}%`;
    cpu.querySelector('[data-line="cpu"]').setAttribute('points', points(s.history));
    cpu.querySelector('[data-temp]').textContent = t('system.temp', { temp: s.temp });

    mem.dataset.status = memStatus(s);
    mem.querySelector('[data-free]').textContent = t('system.free', { free: formatNumber(s.memFree) });
    mem.querySelector('.mem-bar i').style.width = ((s.memTotal - s.memFree) / s.memTotal * 100).toFixed(1) + '%';
    mem.querySelector('[data-used]').textContent = t('system.used', { used: formatNumber(s.memTotal - s.memFree), total: s.memTotal });

    current = s.top;
    setHTML(root.querySelector('.top-list'), s.top.slice(0, 5).map(p => {
      const kill = killState.get(p.name)?.state ?? 'idle';
      const tip = { idle: t('system.kill'), armed: t('system.killArm'), term: t('system.killWait'), force: t('system.killForce') }[kill];
      return `<div class="top-row" data-proc="${p.name}">
        <span class="grow">${p.name}${p.count > 1 ? `<span class="cnt">×${p.count}</span>` : ''}</span>
        <span class="mem">${fmtMem(p.memMiB)}</span>
        ${isProtected(p.name) ? '<span class="kill-slot"></span>'
          : `<button class="ib kill ${kill}" data-kill="${p.name}" title="${tip}">${icon('trash-2')}</button>`}
      </div>`;
    }).join(''));

    const up = root.querySelector('[data-uptime]');
    up.innerHTML = `${icon('power')}${t('system.uptime', { time: uptime(s.bootedAt) })}`;
    up.title = t('system.since', { date: `${dateFormat({ weekday: 'short', day: '2-digit', month: '2-digit' }).format(s.bootedAt)} ${formatTime(s.bootedAt)}` });
  },

  click(target) {
    if (target.closest('[data-screen-off]')) closePopover(); // `hyprctl dispatch dpms toggle <screen>` in the real shell
    if (target.closest('[data-monitor]')) closePopover(); // runs config.commands.monitor in the real shell
    const kill = target.closest('[data-kill]');
    if (kill) {
      const name = kill.dataset.kill, state = killState.get(name)?.state ?? 'idle';
      if (state === 'idle') setKill(name, 'armed');
      else if (state === 'armed') signal(name, 'TERM');   // `kill -TERM <pids>` in the real shell
      else if (state === 'force') signal(name, 'KILL');
    }
  },
};
