const THREE = require('three');
const { camera } = require('constants');
const renderer = require('three/renderer');

const { fov, aspect, near, far, position } = camera;

// adjust camera on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    perspectiveCamera.aspect = aspect();
    perspectiveCamera.updateProjectionMatrix();
});

// necessary instead of using camera directly because both controls
// (OrbitalControls and FlyControls) alter a camera and changing
// controls can only be done by replacing the existing camera
const getCamera = () => perspectiveCamera;
const replaceCamera = (newPosition=position, newRotation=null) => {
    perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect(), near, far);
    perspectiveCamera.position.set(newPosition.x, newPosition.y, newPosition.z);
    if (newRotation) perspectiveCamera.rotation.copy(newRotation);
    return perspectiveCamera;
};

let perspectiveCamera = replaceCamera();

module.exports = { getCamera, replaceCamera };
