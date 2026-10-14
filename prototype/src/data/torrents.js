// One state per torrent, from qBittorrent's own (`state` in
// /api/v2/torrents/info), worst first. Shared with the shell
// (shell/lib/torrents.mjs links here).
//   error        error or missing files
//   stalled      downloading, but no peer sends anything
//   downloading  downloading (also fetching metadata, allocating)
//   checking     checking its files
//   queued       waiting for a download or upload slot
//   paused       stopped by the user
//   seeding      complete and shared (uploading or not)
export const ORDER = ['error', 'stalled', 'downloading', 'checking', 'queued', 'paused', 'seeding'];

const STATES = {
  error: 'error', missingFiles: 'error',
  stalledDL: 'stalled',
  downloading: 'downloading', forcedDL: 'downloading', metaDL: 'downloading', forcedMetaDL: 'downloading', allocating: 'downloading',
  checkingDL: 'checking', checkingUP: 'checking', checkingResumeData: 'checking', moving: 'checking',
  queuedDL: 'queued', queuedUP: 'queued',
  pausedDL: 'paused', stoppedDL: 'paused',
  uploading: 'seeding', forcedUP: 'seeding', stalledUP: 'seeding', pausedUP: 'seeding', stoppedUP: 'seeding',
};
export const statusOf = t => STATES[t.state] ?? 'downloading';

export const worst = list => list.map(statusOf).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0] ?? null;

// worst state first, then the newest
export const sorted = list => list.slice().sort((a, b) =>
  ORDER.indexOf(statusOf(a)) - ORDER.indexOf(statusOf(b)) || b.added_on - a.added_on);

// 5213710708 -> "4.9 GB" (binary units, one decimal under 100)
export function size(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 100 && i ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}
// a speed: "1.2 MB/s"
export const speed = bytes => `${size(bytes)}/s`;
// 0.4567 -> "45%"; 99.95% stays "99%" until it is done
export const percent = p => `${p >= 1 ? 100 : Math.min(99, Math.floor(p * 100))}%`;

// A release name as a title: "The.Rescuers.1977.1080p.DSNP.WEB-DL..." ->
// "The Rescuers (1977)", "Loki.S02.1080p..." -> "Loki · S02",
// "Invader.Zim.S01E03..." -> "Invader Zim · S01E03". The year is the last one
// before the rest of the release ("Blade.Runner.2049.2017..." -> 2017) and
// edition tags go (EXTENDED, REMASTERED...); anything else (an ISO) stays as
// it is.
export function title(name) {
  const words = s => s.replace(/[._]+/g, ' ').replace(/ (EXTENDED|REMASTERED|UNRATED|UNCUT|IMAX|DIRECTORS CUT)\b/gi, '').trim();
  const base = name.replace(/\.(mkv|mp4|avi|m4v|ts)$/i, '');
  const series = base.match(/^(.+?)[. _-]+(S\d{1,2}(?:E\d{1,3})?)(?=[. _-]|$)/i);
  if (series) return `${words(series[1]).replace(/ (19|20)\d{2}$/, '')} · ${series[2].toUpperCase()}`;
  const movie = base.match(/^(.+)[. _(-]+((?:19|20)\d{2})(?=[. _)-]|$)/);
  if (movie) return `${words(movie[1])} (${movie[2]})`;
  return name;
}
