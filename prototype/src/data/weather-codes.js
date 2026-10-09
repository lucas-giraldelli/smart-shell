// WMO weather codes (Open-Meteo) -> label, Lucide icon and tone. Tones reuse the
// colours of waybar's weather module so both bars read the same.
const TONES = {
  clear: '#f9e2af', cloudy: '#bac2de', fog: '#a6adc8',
  rain: '#74c7ec', snow: '#cdd6f4', storm: '#cba6f7',
};

const CODES = {
  0: ['Céu limpo', 'clear'], 1: ['Predominantemente limpo', 'clear'], 2: ['Parcialmente nublado', 'cloudy'],
  3: ['Nublado', 'cloudy'], 45: ['Neblina', 'fog'], 48: ['Neblina com gelo', 'fog'],
  51: ['Garoa leve', 'rain'], 53: ['Garoa moderada', 'rain'], 55: ['Garoa intensa', 'rain'],
  56: ['Garoa congelante', 'rain'], 57: ['Garoa congelante', 'rain'],
  61: ['Chuva leve', 'rain'], 63: ['Chuva moderada', 'rain'], 65: ['Chuva forte', 'rain'],
  66: ['Chuva congelante', 'rain'], 67: ['Chuva congelante', 'rain'],
  71: ['Neve leve', 'snow'], 73: ['Neve moderada', 'snow'], 75: ['Neve forte', 'snow'], 77: ['Grânulos de neve', 'snow'],
  80: ['Pancadas leves', 'rain'], 81: ['Pancadas moderadas', 'rain'], 82: ['Pancadas fortes', 'rain'],
  85: ['Pancadas de neve', 'snow'], 86: ['Pancadas de neve fortes', 'snow'],
  95: ['Trovoada', 'storm'], 96: ['Trovoada com granizo', 'storm'], 99: ['Trovoada com granizo', 'storm'],
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
  const [label, tone] = CODES[code] ?? ['Desconhecido', 'cloudy'];
  // a clear night is drawn in the cloudy tone, not sun-yellow
  const color = tone === 'clear' && !isDay ? TONES.cloudy : TONES[tone];
  return { label, tone, color, icon: iconFor(code, isDay) };
}
