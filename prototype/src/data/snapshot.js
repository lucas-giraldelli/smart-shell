// A snapshot of one real machine (hyprctl, wpctl, ddcutil, bluetoothctl, docker ps)
// taken when the prototype was made. It stands in for the live services the real
// shell reads, and it is the only machine-specific file in the prototype.

// Which optional backends exist on this machine (`command -v`, adapter present...).
// Features that depend on a missing one are shown disabled (see data/capabilities.js).
export const capabilities = {
  bluetooth: true,    // bluetoothd + an adapter
  ddcutil: true,      // external monitor brightness over DDC/CI
  docker: true,
  hyprsunset: true,   // night light
};

// Workspace icons mirror waybar's `format-icons`; window lists come from `hyprctl clients`.
export const workspaces = [
  { id: 1, icon: 'house', windows: ['Zen'] },
  { id: 2, icon: 'git-branch', windows: ['Jira', 'Slack'] },
  { id: 3, icon: 'code', windows: ['VS Code', 'Kitty', 'Kitty', 'Kitty'] },
  { id: 4, icon: 'globe', windows: ['Chrome', 'Chrome'] },
  { id: 5, icon: 'gamepad-2', windows: ['Steam'] },
  { id: 6, icon: 'database', windows: ['DBeaver'] },
  { id: 7, icon: 'music', windows: ['YouTube Music', 'WhatsApp'] },
  { id: 8, icon: 'mail', windows: ['Thunderbird'] },
  { id: 9, icon: 'terminal', windows: ['Kitty', 'Kitty'] },
  { id: 10, icon: 'download', windows: ['Kitty', 'Chrome', 'Chrome'] },
];
export const activeWorkspace = 9;

// `icon` is a file in assets/icons/apps (Papirus-Dark).
export const apps = [
  { icon: 'kitty', name: 'Kitty', running: true },
  { icon: 'zen-browser', name: 'Zen Browser', running: true },
  { icon: 'google-chrome', name: 'Chrome', running: true },
  { icon: 'code', name: 'VS Code', running: true },
  { icon: 'dbeaver', name: 'DBeaver', running: true },
  { icon: 'slack', name: 'Slack', running: true },
  { icon: 'whatsapp', name: 'WhatsApp', running: true },
  { icon: 'youtube-music', name: 'YouTube Music', running: true },
  { icon: 'thunderbird', name: 'Thunderbird', running: true },
  { icon: 'steam', name: 'Steam', running: true },
  { icon: 'system-file-manager', name: 'Nemo', running: false },
  { icon: 'vlc', name: 'VLC', running: false },
];

export const tray = ['steam', 'slack', 'discord', 'spotify'];

export const memory = { totalGiB: 47, freeGiB: 26.4 };

// The user's processes grouped by executable (`ps` RSS + /proc/<pid>/exe):
// the biggest memory users, with how many processes each runs. `stubborn`
// only drives the mock: it ignores SIGTERM, so the force step shows.
export const processes = [
  { name: 'zen', count: 31, memMiB: 4210 },
  { name: 'chromium', count: 23, memMiB: 2875 },
  { name: 'slack', count: 9, memMiB: 1104 },
  { name: 'code', count: 14, memMiB: 980, stubborn: true },
  { name: 'Hyprland', count: 1, memMiB: 412 },
  { name: 'steam', count: 6, memMiB: 390 },
];

// `uptime -s`; the real shell derives it from /proc/uptime
export const bootedAt = '2026-10-04T18:00:20-04:00';

export const bluetooth = {
  on: false,
  devices: [
    { name: 'C95', battery: 80, connected: false },
    { name: 'Kuba Mali 2', battery: 64, connected: false },
  ],
};

export const audio = {
  volume: 88,
  sinks: [
    // `kind` (connection) and `where` (the sound card's place) are translated
    // under volume.kinds / volume.where; an onboard output without a name gets
    // volume.titles.<kind>
    { id: 'hdmi', name: 'Odyssey G60SD', kind: 'hdmi', where: 'gpu', icon: 'monitor' },
    { id: 'spdif', kind: 'spdif', where: 'board', icon: 'speaker' },
  ],
  sink: 'hdmi',
  mic: { name: 'USB Composite Device', volume: 73 },
  streams: [{ name: 'Zen Browser', volume: 100 }],
};

export const display = { name: 'Odyssey G60SD', brightness: 30 };

export const network = {
  online: true,  // waybar's network-status.sh: ping google.com
  iface: 'enp8s0', kind: 'Ethernet', speed: '1 Gb/s',
  ip: '192.168.100.63', gateway: '192.168.100.1', dockerNet: '172.19.0.1/16',
  // openvpn3 configs-list (and NetworkManager VPNs); vpnServer: the first remote's short name
  vpnProfiles: ['TrackFive'], vpnServer: 'br-gru',
};

// `systemctl is-active docker` + `docker ps -a` + `docker stats` (memory in MiB).
// A container `state` is running | paused | restarting | exited; `exitCode`
// matters only when exited. `project` is its compose project ('' = none),
// `restart` its restart policy, `health` healthy | unhealthy | ''.
const containerMemMiB = {
  'atlas-db': 63.6, atlas: 2.4, jellyseerr: 58.4, bazarr: 171.1, radarr: 131.3, sonarr: 189.1, prowlarr: 36.5,
  jellyfin: 147.4, qbittorrent: 28.6, gluetun: 49, flaresolverr: 6.4, redis: 2.4, cloudflared: 21.8, 'torrent-indexer': 2.6,
};
export const docker = {
  running: true,
  containers: Object.entries(containerMemMiB).map(([name, memMiB]) => ({
    name, memMiB, state: 'running', exitCode: 0, restart: 'unless-stopped',
    // two compose projects and one standalone container
    project: name.startsWith('atlas') ? 'atlas' : name === 'cloudflared' ? '' : 'media-stack',
    health: name === 'jellyfin' || name === 'gluetun' ? 'healthy' : '',
  })),
};

// City-level location (waybar's ip-api cache) and an Open-Meteo forecast sample,
// used when the live fetch in services/weather.js fails.
export const weather = {
  city: 'Cuiabá', lat: -15.6, lon: -56.1,
  current: { temp: 34, feels: 36, humidity: 44, wind: 11, code: 3, isDay: true },
  hourly: [
    ['09:00', 33, 3, 0, 1], ['10:00', 34, 3, 0, 1], ['11:00', 35, 3, 4, 1], ['12:00', 35, 3, 14, 1],
    ['13:00', 36, 2, 28, 1], ['14:00', 37, 2, 39, 1], ['15:00', 36, 1, 46, 1], ['16:00', 36, 2, 50, 1],
    ['17:00', 27, 53, 49, 1], ['18:00', 26, 55, 40, 0], ['19:00', 27, 51, 25, 0], ['20:00', 26, 1, 14, 0],
  ].map(([time, temp, code, precip, isDay]) => ({ time, temp, code, precip, isDay: !!isDay })),
  daily: [
    ['2026-10-09', 25, 37, 55, 50], ['2026-10-10', 25, 35, 80, 86], ['2026-10-11', 25, 33, 95, 35],
    ['2026-10-12', 24, 36, 51, 39], ['2026-10-13', 26, 36, 51, 61], ['2026-10-14', 25, 35, 53, 56],
    ['2026-10-15', 25, 29, 95, 72],
  ].map(([date, min, max, code, precip]) => ({ date, min, max, code, precip })),
};

export const media = { title: 'Midnight City', artist: 'M83', source: 'YouTube Music', url: 'https://music.youtube.com/watch?v=dX3k_QDnzHE' };

// pull requests (gh api graphql in the shell): one of each state
const pr = (repo, number, title, checks, mergeState, review, merged = false) =>
  ({ repo, number, title, url: `https://github.com/${repo}/pull/${number}`, checks, mergeState, review, merged });
export const prs = [
  pr('acme/storefront', 412, 'Fix checkout total rounding for multi-currency carts', 'FAILURE', 'BLOCKED', 'REVIEW_REQUIRED'),
  pr('acme/storefront', 409, 'Add product search filters to the catalog page', 'SUCCESS', 'BEHIND', 'APPROVED'),
  pr('acme/storefront', 398, 'Cache category pages for anonymous visitors', 'SUCCESS', 'CLEAN', 'APPROVED'),
  pr('acme/api', 88, 'Rate-limit the public webhooks endpoint', 'PENDING', 'BLOCKED', 'REVIEW_REQUIRED'),
  pr('acme/api', 85, 'Move invoice PDFs to the background queue', 'SUCCESS', 'BLOCKED', 'REVIEW_REQUIRED'),
  pr('lucas/dotfiles', 12, 'Hyprland: tighten the gaps around the dock', 'SUCCESS', 'CLEAN', null, true),
];
