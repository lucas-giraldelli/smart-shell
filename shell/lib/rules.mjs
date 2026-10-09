// Pure rules of the control-center panes, ported line by line from
// prototype/src/components/control-center/panes/*.js. Functions that produce
// text take the I18n singleton (`i18n.t`, `i18n.formatNumber`) as their first
// argument, since modules can't reach QML singletons.

// --- system (panes/system.js) ---
export const memStatus = s => (s.memFree < 4 ? 'crit' : s.memFree < 8 ? 'warn' : 'ok');
export const tempStatus = s => (s.temp >= 87 ? 'crit' : s.temp >= 80 ? 'warn' : 'ok');

// "4 d 16 h" / "3 h 12 min" / "8 min"
export function uptime(i18n, since) {
  const min = Math.floor((Date.now() - since) / 60000);
  const d = Math.floor(min / 1440), h = Math.floor(min / 60) % 24, m = min % 60;
  if (d) return i18n.t('system.uptimeDays', { d, h });
  if (h) return i18n.t('system.uptimeHours', { h, m });
  return i18n.t('system.uptimeMinutes', { m });
}

// --- docker (panes/docker.js) ---
// Status follows waybar's docker-status.sh: service down = crit, any container
// paused / restarting / exited with an error = warn, otherwise ok.
export const counts = cs => ({ up: cs.filter(c => c.state === 'running').length, total: cs.length });
const memOf = c => (c.state === 'running' ? c.memMiB : 0);
// e.g. "910 MiB" / "1,4 GiB"
export const fmtMem = (i18n, mib) => (mib < 1024 ? `${Math.round(mib)} MiB` : `${i18n.formatNumber(mib / 1024)} GiB`);
export const totalMem = docker => (docker.running ? docker.containers.reduce((sum, c) => sum + memOf(c), 0) : 0);
const isBad = c => c.state === 'paused' || c.state === 'restarting' || (c.state === 'exited' && c.exitCode !== 0);

export function dockerStatus(docker) {
  if (!docker.running) return 'crit';
  return docker.containers.some(isBad) ? 'warn' : 'ok';
}

export function containerStatus(c) {
  if (c.state === 'running') return 'ok';
  return isBad(c) ? (c.state === 'exited' ? 'crit' : 'warn') : 'off';
}

export function describe(i18n, c) {
  if (c.state === 'exited') return c.exitCode ? i18n.t('docker.exitedError', { code: c.exitCode }) : i18n.t('common.stopped');
  return i18n.t(`docker.${c.state}`);
}

// --- network (panes/network.js) ---
export const fmtRate = mb => (mb >= 1 ? mb.toFixed(1) + ' MB/s' : Math.round(mb * 1000) + ' KB/s');

// --- brightness / volume ---
export const clampBrightness = v => Math.max(5, Math.min(100, v));
export const clampVolume = v => Math.max(0, Math.min(100, v));
export const brightnessPresets = [['night', 10], ['normal', 30], ['day', 60], ['max', 100]];

// --- capabilities (data/capabilities.js) ---
export const capabilities = {
  bluetooth: { label: 'Bluetooth', install: 'bluez bluez-utils' },
  ddcutil: { label: 'ddcutil', install: 'ddcutil' },
  docker: { label: 'Docker', install: 'docker' },
  hyprsunset: { label: 'hyprsunset', install: 'hyprsunset' },
};
export const missingText = (i18n, cap) => (capabilities[cap] ? i18n.t(`capabilities.${cap}`) : i18n.t('capabilities.unknown', { name: cap }));
export const installHint = cap => capabilities[cap]?.install;
