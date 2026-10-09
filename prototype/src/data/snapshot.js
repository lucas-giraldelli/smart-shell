// A snapshot of one real machine (hyprctl, wpctl, ddcutil, bluetoothctl, docker ps)
// taken when the prototype was made. It stands in for the live services the real
// shell reads, and it is the only machine-specific file in the prototype.

// Which optional backends exist on this machine (`command -v`, adapter present...).
// Features that depend on a missing one are shown disabled (see data/capabilities.js).
export const capabilities = {
  bluetooth: true,    // bluetoothd + an adapter
  ddcutil: true,      // external monitor brightness over DDC/CI
  docker: true,
  hyprsunset: false,  // night light
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
  { icon: 'org.xfce.thunar', name: 'Thunar', running: false },
  { icon: 'vlc', name: 'VLC', running: false },
];

export const tray = ['steam', 'slack', 'discord', 'spotify'];

export const memory = { totalGiB: 47, freeGiB: 26.4 };

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
    { id: 'hdmi', name: 'Odyssey G60SD', meta: 'HDMI · placa de vídeo', icon: 'monitor' },
    { id: 'spdif', name: 'Saída digital onboard', meta: 'S/PDIF · placa-mãe', icon: 'speaker' },
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
  vpn: 'OpenVPN Connect',
};

// `systemctl is-active docker` + `docker ps -a`. A container `state` is
// running | paused | restarting | exited; `exitCode` matters only when exited.
export const docker = {
  running: true,
  containers: [
    'atlas-db', 'atlas', 'jellyseerr', 'bazarr', 'radarr', 'sonarr', 'prowlarr', 'jellyfin',
    'qbittorrent', 'gluetun', 'flaresolverr', 'redis', 'cloudflared', 'torrent-indexer',
  ].map(name => ({ name, state: 'running', exitCode: 0, healthy: name === 'jellyfin' || name === 'gluetun' })),
};

export const weather = { temp: 32, feels: 34, humidity: 53, wind: 9, summary: 'Céu limpo' };

export const media = { title: 'Midnight City', artist: 'M83', source: 'YouTube Music' };
