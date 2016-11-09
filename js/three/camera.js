const { PerspectiveCamera } = require('three');
const { camera } = require('../constants');
const renderer = require('./renderer');

const { fov, aspect, near, far, position } = camera;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    perspectiveCamera.aspect = aspect();
    perspectiveCamera.updateProjectionMatrix();
});

const getCamera = () => perspectiveCamera;

const replaceCamera = (newPosition=position, newRotation=null) => {
    perspectiveCamera = new PerspectiveCamera(fov, aspect(), near, far);
    perspectiveCamera.position.set(newPosition.x, newPosition.y, newPosition.z);
    if (newRotation) perspectiveCamera.rotation.copy(newRotation);
    return perspectiveCamera;
};

let perspectiveCamera = replaceCamera();

module.exports = { getCamera, replaceCamera };
