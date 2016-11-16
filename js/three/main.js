/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const { on } = require('dispatch');

const nodes = require('seeding/nodes');

const { getCamera } = require('three/camera');
const { addLight } = require('three/light');
const renderer = require('three/renderer');
const scene = require('three/scene');
const { updateControls } = require('three/controls');

const { addGlobe, resetGlobe } = require('three/globe');
const { addStars } = require('three/stars');

const setScene = () => {
    addLight();
    addStars();
    addGlobe();

    on('submitted', resetGlobe);

    getCamera().lookAt(scene.position);
    animate();
};

const animate = () => {
    updateControls(1);
    nodes.animate();
    renderer.render(scene, getCamera());
    window.requestAnimationFrame(animate);
};

module.exports = { renderer, setScene };
