/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const { getCamera } = require('three/camera');
const light = require('three/light');
const renderer = require('three/renderer');
const scene = require('three/scene');
const { updateControls } = require('three/controls');

const globe = require('three/globe');
const stars = require('three/stars');
const seeds = require('three/seeds');

const setScene = () => {
    light.create();

    globe.create();
    seeds.create();
    stars.create();

    getCamera().lookAt(scene.position);
    animate();
};

const animate = () => {
    updateControls(1);
    seeds.animate();
    renderer.render(scene, getCamera());
    window.requestAnimationFrame(animate);
};

module.exports = { renderer, setScene };
