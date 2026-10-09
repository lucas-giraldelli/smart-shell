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

// --- top memory users (panes/system.js) ---
// Processes the shell must never offer to kill: the session itself.
export const isProtected = name => /^(Hyprland|qs|quickshell|systemd.*|\(sd-pam\)|pipewire.*|wireplumber|dbus.*|Xwayland|xdg-.*portal.*|fish|bash|zsh|sh|login|sddm.*)$/i.test(name);

// [{ pid, rssKiB, exe }] -> [{ name, count, memMiB, pids }], grouped by
// executable (a browser's many processes are one), biggest first
export function topProcesses(rows, n = 5) {
  const byName = new Map();
  for (const { pid, rssKiB, exe } of rows) {
    const name = exe.split('/').pop().replace(/ \(deleted\)$/, '').replace(/-bin$/, '');
    const g = byName.get(name) ?? { name, count: 0, memMiB: 0, pids: [] };
    g.count++;
    g.memMiB += rssKiB / 1024;
    g.pids.push(pid);
    byName.set(name, g);
  }
  return [...byName.values()].sort((a, b) => b.memMiB - a.memMiB).slice(0, n);
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

// --- volume (panes/volume.js) ---
// What an output is, from its PipeWire properties: `kind` is the connection
// (volume.kinds), `where` the sound card's place (volume.where), `name` the
// device's own name when it has a real one (a monitor's, a headset's).
export function sinkInfo(p) {
  const profile = `${p['device.profile.name'] ?? ''} ${p['api.alsa.path'] ?? ''}`;
  const bus = p['device.bus'] ?? '';
  if ((p['device.api'] ?? '').startsWith('bluez')) return { kind: 'bluetooth', name: p['node.description'] };
  if (bus === 'usb') return { kind: 'usb', name: p['node.nick'] || p['node.description'] };
  const kind = /hdmi|displayport/i.test(profile) ? 'hdmi' : /iec958/i.test(profile) ? 'spdif' : 'analog';
  // HDMI audio lives on the graphics card; anything else on PCI is onboard
  const gpu = /nvidia|radeon|hdmi|\bdp\b/i.test(`${p['alsa.card_name'] ?? ''} ${p['alsa.mixer_name'] ?? ''}`);
  const where = bus === 'pci' ? (gpu ? 'gpu' : 'board') : '';
  // an HDMI output is named after the monitor (its EDID), when known
  const name = kind === 'hdmi' && p['alsa.name'] && !/^HDMI/i.test(p['alsa.name']) ? p['alsa.name'] : undefined;
  return { kind, where, name };
}
export const sinkName = (i18n, s) => s.name ?? i18n.t(`volume.titles.${s.kind}`);
export const sinkMeta = (i18n, s) => [s.kind && i18n.t(`volume.kinds.${s.kind}`), s.where && i18n.t(`volume.where.${s.where}`)].filter(Boolean).join(' · ');

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
