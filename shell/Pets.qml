pragma Singleton

import QtQuick
import Quickshell
import "lib/pets/index.mjs" as Species
import "lib/poses.mjs" as Poses

// The pet species (prototype: components/pets/species, which lib/pets links to;
// species/index.js lists them).
// Every sprite faces right in a 46x36 box with its feet on y=33.
Singleton {
    readonly property var species: Species.species
    readonly property var names: Object.keys(species)

    // the sprite as an image URL; `rest` drops the closed eyes and the tongue
    // (the pet picker's still pose)
    function sprite(name, rest) {
        const s = species[name];
        if (!s)
            return "";
        let body = Poses.partsFor(s.svg, "", "");   // no pose's parts
        if (rest)
            body = body.replace(/<[a-z]+ class="(closed|tongue)[^"]*"[^>]*\/>/g, "");
        return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 36">${body}</svg>`);
    }
}
