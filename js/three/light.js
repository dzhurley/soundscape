'use strict';

const THREE = require('three');
const color = require('../constants').light.color;
const scene = require('./scene');

class Light extends THREE.AmbientLight {
    addToScene() {
        scene.add(this);
    }
}

module.exports = new Light(color);
