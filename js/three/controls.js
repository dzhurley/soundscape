// Tie together Orbital and Fly controls into toggle under radio buttons

const THREE = require('three');
THREE.FlyControls = require('exports?THREE.FlyControls!lib/FlyControls');
THREE.OrbitalControls = require('exports?THREE.OrbitalControls!lib/OrbitControls');

const { flyControls, orbitalControls } = require('constants');
const { on } = require('dispatch');
const { getCamera, replaceCamera } = require('three/camera');
const { container } = require('dom');

let controls;
let next = 'fly';

const setups = {
    fly(cam) {
        controls = new THREE.FlyControls(cam, container);
        Object.assign(controls, flyControls, { domElement: container });
    },

    orbital(cam) {
        controls = new THREE.OrbitControls(cam, container);
        Object.assign(controls, orbitalControls);
    }
};

const toggleControls = () => {
    // ensure the camera is replaced for new controls
    setups[next](replaceCamera(getCamera().position, getCamera().rotation));
    next = next === 'orbital' ? 'fly' : 'orbital';
};

const updateControls = i => controls && controls.update(i);

setups.orbital(getCamera());
on('controls', toggleControls);

module.exports = { updateControls };
