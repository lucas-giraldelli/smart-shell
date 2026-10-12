pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// Current weather and forecast - the prototype `weather` slice
// (prototype/src/services/weather.js): Open-Meteo, the same API waybar
// weather.sh uses, for config.weather lat/lon, refreshed every 10 minutes.
// On failure the last forecast stays.
Singleton {
    id: root

    property bool loaded: false
    property date updatedAt
    property var current: ({ temp: 0, feels: 0, humidity: 0, wind: 0, code: 3, isDay: true })
    property var hourly: []     // [{ time "HH:MM", temp, code, precip, isDay }]
    property var daily: []      // [{ date "YYYY-MM-DD", min, max, code, precip }]

    readonly property string city: Config.weather.city ?? ""
    readonly property string url: "https://api.open-meteo.com/v1/forecast"
        + `?latitude=${Config.weather.lat}&longitude=${Config.weather.lon}`
        + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
        + "&hourly=temperature_2m,weather_code,precipitation_probability,is_day"
        + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
        + "&forecast_days=7&forecast_hours=13&wind_speed_unit=kmh&timezone=auto"

    onUrlChanged: fetch.running = true

    function parse(text) {
        let d;
        try {
            d = JSON.parse(text);
        } catch (e) {
            return;     // offline or API down: keep whatever we have
        }
        if (!d.current)
            return;
        const c = d.current, h = d.hourly, dl = d.daily;
        current = {
            temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m),
            code: c.weather_code, isDay: !!c.is_day
        };
        hourly = h.time.map((t, i) => ({
            time: t.slice(11, 16), temp: Math.round(h.temperature_2m[i]), code: h.weather_code[i],
            precip: h.precipitation_probability[i] ?? 0, isDay: !!h.is_day[i]
        }));
        daily = dl.time.map((date, i) => ({
            date, min: Math.round(dl.temperature_2m_min[i]), max: Math.round(dl.temperature_2m_max[i]),
            code: dl.weather_code[i], precip: dl.precipitation_probability_max[i] ?? 0
        }));
        updatedAt = new Date();
        loaded = true;
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 10 * 60 * 1000
        onTriggered: fetch.running = true
    }

    Process {
        id: fetch
        command: ["curl", "-sf", "--max-time", "15", root.url]
        stdout: StdioCollector {
            onStreamFinished: root.parse(text)
        }
    }
}
