const THREE = require('three');

const { emit } = require('dispatch');
const { globe: { axisSize } } = require('constants');
const { nodes } = require('seeding/nodes');

const scene = require('three/scene');

global.THREE = THREE;
global.scene = scene;
global.nodes = nodes;

[new THREE.AxisHelper(axisSize)].map(helper => scene.add(helper));

// autosubmit when debug() is flipped
emit('submitting', 'lastfm', 'stutterbug42');
