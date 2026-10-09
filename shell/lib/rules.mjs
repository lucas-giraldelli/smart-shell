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
// Only real failures are flagged; stopping a stack on purpose is not one:
//   crit  a container restarting or running unhealthy, one exited with an
//         error while the rest of its compose project still runs, or a
//         non-compose one that exited with an error and has a restart policy
//   off   the Docker service is down, or nothing is running
//   ok    everything else (stopped stacks, paused containers)
export const counts = cs => ({ up: cs.filter(c => c.state === 'running').length, total: cs.length });
const memOf = c => (c.state === 'running' ? c.memMiB : 0);
// e.g. "910 MiB" / "1,4 GiB"
export const fmtMem = (i18n, mib) => (mib < 1024 ? `${Math.round(mib)} MiB` : `${i18n.formatNumber(mib / 1024)} GiB`);
export const totalMem = docker => (docker.running ? docker.containers.reduce((sum, c) => sum + memOf(c), 0) : 0);

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
// project go last, under "Other". A project is crit when one of its containers
// failed, off when none runs, ok otherwise.
export function groups(cs) {
  const byProject = new Map();
  for (const c of cs) {
    if (!byProject.has(c.project)) byProject.set(c.project, []);
    byProject.get(c.project).push(c);
  }
  const list = [...byProject].filter(([p]) => p).map(([project, containers]) => ({ project, containers }));
  if (byProject.has('')) list.push({ project: '', containers: byProject.get('') });
  return list;
}
export function groupStatus(group, cs) {
  if (group.containers.some(c => isFailure(c, cs))) return 'crit';
  return group.containers.some(c => c.state === 'running') ? 'ok' : 'off';
}
export const groupMem = group => group.containers.reduce((sum, c) => sum + memOf(c), 0);

export function containerStatus(c, cs) {
  if (isFailure(c, cs)) return 'crit';
  return c.state === 'running' ? 'ok' : 'off';
}

export function describe(i18n, c, cs) {
  if (c.state === 'exited') return crashed(c, cs) ? i18n.t('docker.exitedError', { code: c.exitCode }) : i18n.t('common.stopped');
  if (unhealthy(c)) return i18n.t('docker.unhealthy');
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
