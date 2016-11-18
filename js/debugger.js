const THREE = require('three');

const { emit } = require('dispatch');
const { globe: { axisSize } } = require('constants');
const { globe } = require('three/globe');
const { nodes } = require('seeding/nodes');

const scene = require('three/scene');

global.debugging = false;

const sceneHelpers = [new THREE.AxisHelper(axisSize)];

const objectHelpers = [{ object: globe, helper: new THREE.WireframeHelper(globe, 0x000000) }];

const activate = () => {
    global.THREE = THREE;
    global.scene = scene;
    global.nodes = nodes;

    sceneHelpers.map(helper => scene.add(helper));
    objectHelpers.map(({ helper }) => scene.add(helper));
};

const deactivate = () => {
    delete global.THREE;
    delete global.scene;
    delete global.nodes;

    sceneHelpers.map(helper => scene.remove(helper));
    objectHelpers.map(({ helper }) => scene.remove(helper));
};

const debug = () => {
    global.debugging = !global.debugging;
    global.debugging ? activate() : deactivate();

    // autosubmit when debug() is flipped
    emit('submitting', 'lastfm', 'stutterbug42');
};

module.exports = debug;
