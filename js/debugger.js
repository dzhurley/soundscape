const THREE = require('three');

const { globe: { axisSize } } = require('constants');
const { globe } = require('three/globe');

const scene = require('three/scene');

global.debugging = false;

const sceneHelpers = [new THREE.AxisHelper(axisSize)];

const objectHelpers = [{ object: globe, helper: new THREE.WireframeHelper(globe) }];

const activate = () => {
    global.THREE = THREE;
    global.scene = scene;

    sceneHelpers.map(helper => scene.add(helper));
    objectHelpers.map(({ helper }) => scene.add(helper));
};

const deactivate = () => {
    delete global.THREE;
    delete global.scene;

    sceneHelpers.map(helper => scene.remove(helper));
    objectHelpers.map(({ helper }) => scene.remove(helper));
};

const debug = () => {
    global.debugging = !global.debugging;
    global.debugging ? activate() : deactivate();
};

module.exports = debug;
