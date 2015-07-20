'use strict';

let THREE = require('three');
let Constants = require('../constants');
let scene = require('./scene');

class Light extends THREE.AmbientLight {
    constructor(color) {
        super(color);
    }

    addToScene() {
        scene.add(this);
    }
}

module.exports = new Light(Constants.light.color);
