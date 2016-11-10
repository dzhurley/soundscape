/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const THREE = require('three');
const { globe: { axisSize } } = require('constants');
const { on } = require('dispatch');
const { isActive } = require('labs');

const { getCamera } = require('three/camera');
const { addLight } = require('three/light');
const renderer = require('three/renderer');
const scene = require('three/scene');
const { updateControls } = require('three/controls');

const { addGlobe, globe, resetGlobe } = require('three/globe');
const { addStars } = require('three/stars');

const { iterateForce } = require('seeding/force');

// TODO: helpers.js?
const childWithPrototype = o => scene.children.find(c => c.constructor.prototype === o.prototype);
const toggleChild = child => state => state ? scene.add(child) : scene.remove(child);

const bindHelpers = () => {
    // red: x, green: y, blue: z
    if (isActive('AxisHelper')) scene.add(new THREE.AxisHelper(axisSize));
    if (isActive('WireframeHelper')) scene.add(new THREE.WireframeHelper(globe));

    on('lab.AxisHelper', toggleChild(childWithPrototype(THREE.AxisHelper)));
    on('lab.WireframeHelper', toggleChild(childWithPrototype(THREE.WireframeHelper)));
};

const setScene = () => {
    addLight();
    addStars();
    addGlobe();

    bindHelpers();
    on('submitted', resetGlobe);
    on('lab.reset', resetGlobe);

    getCamera().lookAt(scene.position);
    animate();
};

const animate = () => {
    updateControls(1);
    if (isActive('forceSeeding') && !window.seeded) window.seeded = iterateForce();
    renderer.render(scene, getCamera());
    window.requestAnimationFrame(animate);
};

module.exports = { renderer, setScene };
