// Exposes certain globals for interaction in browser.
//
// Drop a require('debugger') in app.js to use, it's a one way flip.

const THREE = require('three');

const { globe: { axisSize } } = require('constants');
const { emit } = require('dispatch');
const { qs } = require('helpers');

const scene = require('three/scene');

global.THREE = THREE;
global.scene = scene;

scene.add(new THREE.AxisHelper(axisSize));

// autosubmit when required
const testUser = 'stutterbug42';
emit('submitting', testUser);
qs('.username').textContent = testUser;
