'use strict';

const { PerspectiveCamera } = require('three');
const { camera } = require('../constants');
const renderer = require('./renderer');

const { fov, aspect, near, far, position } = camera;
const perspectiveCamera = new PerspectiveCamera(fov, aspect(), near, far);

perspectiveCamera.position.set(position.x, position.y, position.z);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    perspectiveCamera.aspect = camera.aspect();
    perspectiveCamera.updateProjectionMatrix();
});

module.exports = perspectiveCamera;
