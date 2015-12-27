'use strict';

/* Tie together Orbital and Fly controls into toggle under button */

// TODO find a better way
let THREE = require('../lib/FlyControls');
THREE = require('../lib/OrbitControls');

const { flyControls, orbitalControls } = require('../constants');
const { on } = require('../dispatch');
const { getCamera, replaceCamera } = require('./camera');
const { container } = require('../dom');

const setups = {
    setupFly(cam) {
        controls = new THREE.FlyControls(cam, container);
        Object.assign(controls, flyControls, { domElement: container });
    },

    setupOrbital(cam) {
        controls = new THREE.OrbitControls(cam, container);
        Object.assign(controls, orbitalControls);
    }
};

const toggleControls = label => {
    setups[`setup${label}`](replaceCamera(getCamera().position, getCamera().rotation));
    // TODO: constants
    label = label === 'Orbital' ? 'Fly' : 'Orbital';
    document.getElementById('toggleControls').textContent = label;
};

let controls;
setups.setupOrbital(getCamera());
on('toggleControls', toggleControls);

module.exports = {
    updateControls: i => controls && controls.update(i)
};
