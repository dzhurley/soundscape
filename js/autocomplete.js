const TWEEN = require('tween.js');

const { faceCentroid, qs, qsa } = require('helpers');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');
const scene = require('three/scene');

let artists;
const input = qs('.autocomplete input');

const focus = name => {
    const cam = getCamera();
    const match = globe.geometry.faces.find(f => f.data.artist === name && f.data.center);

    const length = cam.position.length();
    const { x, y, z } = faceCentroid(globe, match).setLength(length);
    new TWEEN.Tween({ x: cam.position.x, y: cam.position.y, z: cam.position.z })
        .to({ x, y, z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() {
            cam.position.set(this.x, this.y, this.z);
            cam.position.setLength(length);
            cam.lookAt(scene.position);
        })
        .onComplete(() => cam.lookAt(scene.position))
        .start();

    renderFor();
    input.value = name;
};

const suggest = name => {
    return Array.from(artists)
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

        if (!active) {
            list[0].classList.add('active');
            input.value = list[0].textContent;
            return;
        }

        const newIndex = offset(list.indexOf(active));
        if (newIndex < 0 || newIndex >= list.length) return;

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
    '13': evt => artists.has(evt.target.value) && focus(evt.target.value)
};

const bindAutocomplete = () => {
    artists = globe.geometry.faces.reduce((memo, face) => {
        if (face.data.artist) memo.add(face.data.artist);
        return memo;
    }, new Set());

    qs('#scape').addEventListener('click', () => {
        renderFor();
        input.blur();
    });
    qs('.autocomplete').addEventListener('keyup', evt => {
        const key = evt.keyCode.toString();
        key in keys ? keys[key](evt) : renderFor(evt.target.value);
    });
};

module.exports = bindAutocomplete;
