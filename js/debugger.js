// Exposes certain globals for interaction in browser.
//
// Drop a require('debugger') in app.js to use, it's a one way flip.

const THREE = require('three');

const { emit } = require('dispatch');
const { globe: { axisSize } } = require('constants');

const scene = require('three/scene');

global.THREE = THREE;
global.scene = scene;

scene.add(new THREE.AxisHelper(axisSize));

// autosubmit when required
emit('submitting', 'lastfm', 'stutterbug42');
