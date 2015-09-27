'use strict';

const THREE = require('three');

class Renderer extends THREE.WebGLRenderer {
    constructor() {
        super();
        this.setSize(window.innerWidth, window.innerHeight);
    }
}

module.exports = new Renderer();
