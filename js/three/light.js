'use strict';

let THREE = require('three');
let scene = require('./scene');

class Light extends THREE.AmbientLight {
    constructor(color) {
        super(color);
    }

    addToScene() {
        scene.add(this);
    }
}

module.exports = new Light(0xf0f0f0);
