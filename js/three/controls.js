'use strict';

/* Tie together Orbital and Fly controls into toggle under button */

// TODO find a better way
let THREE = require('../lib/FlyControls');
THREE = require('../lib/OrbitControls');

const { camera, flyControls, orbitalControls } = require('../constants');
const Threes = require('./main');
const { container } = require('../dom');

const setups = {
    setupFly() {
        controls = new THREE.FlyControls(Threes.camera, container);
        Object.assign(controls, flyControls, { domElement: container });
    },

    setupOrbital() {
        controls = new THREE.OrbitControls(Threes.camera, container);
        Object.assign(controls, orbitalControls);
    }
};

const toggleControls = label => {
    let prevCamera = Threes.camera;

    // TODO: use './camera' instead of THREE.PerspectiveCamera to preserve
    // resize event handler on window
    let { fov, aspect, near, far } = camera;
    Threes.camera = new THREE.PerspectiveCamera(fov, aspect(), near, far);
    Threes.camera.position.copy(prevCamera.position);
    Threes.camera.rotation.copy(prevCamera.rotation);

    setups[`setup${label}`]();
    // TODO: constants
    label = label === 'Orbital' ? 'Fly' : 'Orbital';
    document.getElementById('toggleControls').textContent = label;
};

let controls;
setups.setupOrbital();

module.exports = {
    toggleControls,
    updateControls: i => controls.update(i)
};
