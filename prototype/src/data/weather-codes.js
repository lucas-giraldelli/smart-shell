import { t } from '../i18n/index.js';

// WMO weather codes (Open-Meteo) -> tone and Lucide icon; labels are translated
// under `weather.codes.<code>`. Tones reuse the colours of waybar's weather
// module so both bars read the same.
const TONES = {
  clear: '#f9e2af', cloudy: '#bac2de', fog: '#a6adc8',
  rain: '#74c7ec', snow: '#cdd6f4', storm: '#cba6f7',
};

const TONE_OF = {
  0: 'clear', 1: 'clear', 2: 'cloudy', 3: 'cloudy', 45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain', 61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow', 80: 'rain', 81: 'rain', 82: 'rain', 85: 'snow', 86: 'snow',
  95: 'storm', 96: 'storm', 99: 'storm',
};

function iconFor(code, isDay) {
  if (code <= 1) return isDay ? 'sun' : 'moon';
  if (code === 2) return isDay ? 'cloud-sun' : 'cloud-moon';
  if (code === 3) return 'cloud';
  if (code <= 48) return 'cloud-fog';
  if (code <= 57) return 'cloud-drizzle';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'cloud-rain';
  if (code <= 77 || code === 85 || code === 86) return 'cloud-snow';
  return 'cloud-lightning';
}

export function describe(code, isDay = true) {
  const tone = TONE_OF[code] ?? 'cloudy';
  const label = t(`weather.codes.${code in TONE_OF ? code : 'unknown'}`);
  // a clear night is drawn in the cloudy tone, not sun-yellow
  const color = tone === 'clear' && !isDay ? TONES.cloudy : TONES[tone];
  return { label, tone, color, icon: iconFor(code, isDay) };
}
