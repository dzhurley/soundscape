'use strict';

/* Tie together Orbital and Fly controls into toggle under button */

// TODO find a better way
let THREE = require('../lib/FlyControls');
THREE = require('../lib/OrbitControls');

let Constants = require('../constants');
let Threes = require('./main');
let DOM = require('../dom');

class Controls {
    constructor(label = 'Orbital') {
        this.label = label;
        this[`setup${label}`]();
    }

    setButtonText(text) {
        document.getElementById('toggleControls').textContent = text;
    }

    setupFly() {
        this.active = new THREE.FlyControls(Threes.camera, DOM.container);
        Object.assign(this.active, Constants.flyControls, { domElement: DOM.container });
    }

    setupOrbital() {
        this.active = new THREE.OrbitControls(Threes.camera, DOM.container);
        Object.assign(this.active, Constants.orbitalControls);
    }

    toggleControls() {
        let prevCamera = Threes.camera;

        // TODO: use './camera' instead of THREE.PerspectiveCamera to preserve
        // resize event handler on window
        Threes.camera = new THREE.PerspectiveCamera(
            Constants.camera.fov,
            Constants.camera.aspect(),
            Constants.camera.near,
            Constants.camera.far
        );
        Threes.camera.position.copy(prevCamera.position);
        Threes.camera.rotation.copy(prevCamera.rotation);

        this.setButtonText(this.label);
        this.label = this.label === 'Orbital' ? 'Fly' : 'Orbital';
        this[`setup${this.label}`]();
    }

    update(interval) {
        this.active.update(interval);
    }
}

module.exports = new Controls();
