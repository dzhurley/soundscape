'use strict';

const THREE = require('three');
const camera = require('../constants').camera;
const renderer = require('./renderer');

class Camera extends THREE.PerspectiveCamera {
    constructor(fov, aspect, near, far) {
        super(fov, aspect, near, far);

        this.position.x = camera.initialX;
        this.position.y = camera.initialY;
        this.position.z = camera.initialZ;

        this.bindResize();
    }

    bindResize() {
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            this.aspect = camera.aspect();
            this.updateProjectionMatrix();
        });
    }
}

module.exports = new Camera(camera.fov, camera.aspect(), camera.near, camera.far);
