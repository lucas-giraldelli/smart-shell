pragma Singleton

import QtQuick
import Quickshell
import "lib/locales/pt-BR.mjs" as PtBR
import "lib/locales/en.mjs" as En

// Translations (prototype/src/i18n/index.js). The locale files are the
// prototype's own (lib/locales links to them), so both share every string.
// t("a.b", { name }) reads one; values are strings with {placeholders}, lists,
// or functions of the params. Missing keys fall back to English, then to the
// key itself.
Singleton {
    id: root

    readonly property var locales: ({ "pt-BR": PtBR.default, "en": En.default })
    readonly property string fallback: "en"

    // the dock settings' choice, then config.locale, then the system's
    readonly property string current: pick(Ui.locale || Config.locale || Qt.locale().name.replace("_", "-"))
    readonly property var qtLocale: Qt.locale(current.replace("-", "_"))

    function pick(wanted) {
        if (locales[wanted])
            return wanted;
        const lang = wanted.split("-")[0];
        return Object.keys(locales).find(k => k.split("-")[0] === lang) ?? fallback;
    }

    function lookup(dict, key) {
        return key.split(".").reduce((node, part) => node?.[part], dict);
    }

    function t(key, params) {
        params = params ?? {};
        const value = lookup(locales[current], key) ?? lookup(locales[fallback], key);
        if (value === undefined)
            return key;
        if (typeof value === "function")
            return value(params);
        if (Array.isArray(value))
            return value;
        return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
    }

    // Dates the way the prototype's Intl formats print them, per language
    // (Qt has no Intl, so the patterns are spelled out): date "sex, 09 de out",
    // mini "sex, 09", month "outubro de 2026", long "sexta-feira, 9 de
    // outubro", short "12 out". Times don't depend on the language.
    readonly property var patterns: ({
        "pt-BR": { date: "ddd, dd 'de' MMM", mini: "ddd, dd", month: "MMMM 'de' yyyy", long: "dddd, d 'de' MMMM", short: "d MMM" },
        "en": { date: "ddd, MMM dd", mini: "ddd dd", month: "MMMM yyyy", long: "dddd, MMMM d", short: "MMM d" }
    })
    function formatDate(date, kind) {
        const pattern = (patterns[current] ?? patterns[fallback])[kind];
        return qtLocale.toString(date, pattern).replace(/\./g, "");
    }
    // times follow config.clock.format: "14:05" or "2:05 PM"
    function formatTime(date) {
        const h = date.getHours(), m = String(date.getMinutes()).padStart(2, "0");
        return Config.clockFormat === "12h" ? `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}` : `${String(h).padStart(2, "0")}:${m}`;
    }
    // an hour on its own (the hourly forecast): "13h" / "1 PM"
    function formatHour(h) {
        return Config.clockFormat === "12h" ? `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}` : `${String(h).padStart(2, "0")}h`;
    }
    function capitalize(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    }

    // formatNumber(n, digits = 1): fixed decimals in the current locale
    function formatNumber(n, digits) {
        return Number(n).toLocaleString(qtLocale, "f", digits ?? 1);
    }
}
