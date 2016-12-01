const animations = require('animations');
const { faceCentroid, qs, qsa } = require('helpers');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');
const scene = require('three/scene');

// current artist data backing autocomplete results
let artists;

const input = qs('.autocomplete input');

const focus = name => {
    const cam = getCamera();
    const length = cam.position.length();

    // find best center position for searched artist area
    const match = globe.geometry.faces.find(f => f.data.artist === name && f.data.center);
    const final = faceCentroid(globe, match).setLength(length);

    // animate camera to artist's location
    animations.autocomplete.focus(cam.position, final)
        .onUpdate(function() {
            cam.position.set(this.x, this.y, this.z);
            cam.position.setLength(length);
            cam.lookAt(scene.position);
        })
        .onComplete(() => cam.lookAt(scene.position))
        .start();

    // close suggestions with match filled in input
    renderFor();
    input.value = name;
};

const suggest = name => {
    return artists
        .filter(artist => artist.startsWith(name))
        .sort()
        .reduce((memo, artist) => memo += `<li>${artist}</li>`, '');
};

const renderFor = name => {
    const list = qs('.ac-suggestions');

    if (!name) return list.innerHTML = '';

    list.innerHTML = suggest(name);
    list.addEventListener('click', evt => focus(evt.target.textContent));
};

const handleArrow = offset => {
    return () => {
        const list = qsa('.ac-suggestions li');
        const active = qs('.ac-suggestions .active');

        // enter into list if we're still active in input
        if (!active) {
            list[0].classList.add('active');
            input.value = list[0].textContent;
            return;
        }

        // otherwise traverse list
        const newIndex = offset(list.indexOf(active));
        if (newIndex < 0 || newIndex >= list.length) return;

        // annotate current selection for subsequent arrows
        active.classList.remove('active');
        list[newIndex].classList.add('active');
        input.value = list[newIndex].textContent;
    };
};

const keys = {
    // up
    '38': handleArrow(index => index - 1),
    // down
    '40': handleArrow(index => index + 1),
    // enter
    '13': evt => artists.includes(evt.target.value) && focus(evt.target.value)
};

const update = () => {
    artists = Array.from(globe.geometry.faces.reduce((memo, face) => {
        if (face.data.artist) memo.add(face.data.artist);
        return memo;
    }, new Set()));
};

const create = () => {
    // click off autocomplete
    qs('#scape').addEventListener('click', () => {
        renderFor();
        input.blur();
    });

    qs('.autocomplete').addEventListener('keyup', evt => {
        const key = evt.keyCode.toString();
        key in keys ? keys[key](evt) : renderFor(evt.target.value);
    });
};

module.exports = { create, update };
