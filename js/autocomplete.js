const { faceCentroid, qs, qsa } = require('helpers');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');

let artists;
const input = qs('.autocomplete input');

const focus = name => {
    const cam = getCamera();
    const match = globe.geometry.faces.find(f => f.data.artist === name && f.data.center);
    // TODO: add Tweens
    cam.position.copy(faceCentroid(globe, match).setLength(cam.position.length()));
    cam.lookAt(globe);
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
