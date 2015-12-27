'use strict';

// used on both app and worker side to create some sense of coherence
const { MeshBasicMaterial, SphereGeometry } = require('three');

const globe = Object.freeze({
    radius: 50,
    widthAndHeight: 50
});

const labels = Object.freeze({
    'backgroundColor': '#272727',
    'color': '#d7d7d7',
    'fontface': 'Inconsolata',
    'fontsize': '300'
});

const node = Object.freeze({
    geometry: new SphereGeometry(1.5, 25, 25),
    material: new MeshBasicMaterial()
});

const stars = Object.freeze({
    number: 1000,

    x() {
        return Math.random() * 2 - 1;
    },
    y() {
        return Math.random() * 2 - 1;
    },
    z() {
        return Math.random() * 2 - 1;
    },

    positionMultiplier() {
        return Math.random() * 100 + 200;
    },
    scaleMultiplier() {
        return Math.random() * 0.5;
    }
});

const camera = Object.freeze({
    position: { x: 80, y: 80, z: 80 },

    fov: 75,
    aspect() {
        // needs to be callable as constants are used in workers, which don't have window
        return window.innerWidth / window.innerHeight;
    },
    near: 0.1,
    far: 1000
});

const light = Object.freeze({ color: 0xf0f0f0 });

const flyControls = Object.freeze({
    autoForward: false,
    dragToLook: true,
    movementSpeed: 1,
    rollSpeed: 0.03
});

const orbitalControls = Object.freeze({
    zoomSpeed: 0.2,
    rotateSpeed: 0.5,
    noKeys: true
});

module.exports = Object.freeze({
    camera,
    flyControls,
    globe,
    labels,
    light,
    node,
    orbitalControls,
    stars
});
