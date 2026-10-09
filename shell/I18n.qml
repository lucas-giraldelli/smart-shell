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

    // formatNumber(n, digits = 1): fixed decimals in the current locale
    function formatNumber(n, digits) {
        return Number(n).toLocaleString(qtLocale, "f", digits ?? 1);
    }
}
