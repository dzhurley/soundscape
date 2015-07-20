'use strict';

let THREE = require('three');
let Constants = require('../constants');
let renderer = require('./renderer');

class Camera extends THREE.PerspectiveCamera {
    constructor(fov, aspect, near, far) {
        super(fov, aspect, near, far);

        this.position.x = Constants.camera.initialX;
        this.position.y = Constants.camera.initialY;
        this.position.z = Constants.camera.initialZ;

        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.aspect = Constants.camera.aspect();
        this.updateProjectionMatrix();
    }
}

module.exports = new Camera(
    Constants.camera.fov,
    Constants.camera.aspect(),
    Constants.camera.near,
    Constants.camera.far
);
