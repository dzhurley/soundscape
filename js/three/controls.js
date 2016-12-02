// Tie together Orbital and Fly controls into toggle under button

const THREE = require('three');
THREE.FlyControls = require('exports?THREE.FlyControls!lib/FlyControls');
THREE.OrbitalControls = require('exports?THREE.OrbitalControls!lib/OrbitControls');

const { flyControls, orbitalControls } = require('constants');
const { on } = require('dispatch');
const { getCamera, replaceCamera } = require('three/camera');
const { container } = require('dom');

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
    // ensure the camera is replaced for new controls
    setups[`setup${label}`](replaceCamera(getCamera().position, getCamera().rotation));
    label = label === 'Orbital' ? 'Fly' : 'Orbital';
    document.getElementById('toggleControls').textContent = label;
};

const updateControls = i => controls && controls.update(i);

let controls;
setups.setupOrbital(getCamera());
on('toggleControls', toggleControls);

module.exports = { updateControls };
