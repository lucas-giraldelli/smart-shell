import { store, update } from '../state.js';

// Live forecast from Open-Meteo (the same API waybar's weather.sh uses), refreshed
// every 10 minutes. On failure the snapshot sample stays in place.
const REFRESH_MS = 10 * 60 * 1000;

async function refresh() {
  const { lat, lon } = store.get().weather;
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
    + '&hourly=temperature_2m,weather_code,precipitation_probability,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + '&forecast_days=7&forecast_hours=13&wind_speed_unit=kmh&timezone=auto';
  try {
    const d = await (await fetch(url)).json();
    const c = d.current, h = d.hourly, dl = d.daily;
    update('weather', {
      source: 'live',
      updatedAt: new Date(),
      current: {
        temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m),
        code: c.weather_code, isDay: !!c.is_day,
      },
      hourly: h.time.map((t, i) => ({
        time: t.slice(11, 16), temp: Math.round(h.temperature_2m[i]), code: h.weather_code[i],
        precip: h.precipitation_probability[i] ?? 0, isDay: !!h.is_day[i],
      })),
      daily: dl.time.map((date, i) => ({
        date, min: Math.round(dl.temperature_2m_min[i]), max: Math.round(dl.temperature_2m_max[i]),
        code: dl.weather_code[i], precip: dl.precipitation_probability_max[i] ?? 0,
      })),
    });
  } catch {
    // offline or API down: keep whatever we have
  }
}

export function startWeather() {
  refresh();
  setInterval(refresh, REFRESH_MS);
}
