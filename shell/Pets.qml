pragma Singleton

import QtQuick
import Quickshell
import "lib/pets/cat.mjs" as Cat
import "lib/pets/shiba.mjs" as Shiba
import "lib/pets/fox.mjs" as Fox
import "lib/pets/penguin.mjs" as Penguin
import "lib/pets/bunny.mjs" as Bunny
import "lib/pets/capy.mjs" as Capy
import "lib/pets/frog.mjs" as Frog

// The pet species (prototype: components/pets/species, linked from lib/pets).
// Every sprite faces right in a 46x36 box with its feet on y=33.
Singleton {
    readonly property var species: ({
        cat: Cat.default, shiba: Shiba.default, fox: Fox.default, penguin: Penguin.default,
        bunny: Bunny.default, capy: Capy.default, frog: Frog.default
    })
    readonly property var names: Object.keys(species)

    // the sprite as an image URL; `rest` drops the closed eyes and the tongue
    // (the pet picker's still pose)
    function sprite(name, rest) {
        const s = species[name];
        if (!s)
            return "";
        let body = s.svg;
        if (rest)
            body = body.replace(/<[a-z]+ class="(closed|tongue)[^"]*"[^>]*\/>/g, "");
        return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 36">${body}</svg>`);
    }
}
