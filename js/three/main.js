'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const THREE = require('three');
const { on } = require('../dispatch');

const { getCamera } = require('./camera');
const { addLight } = require('./light');
const renderer = require('./renderer');
const scene = require('./scene');
const { updateControls } = require('./controls');

const { addGlobe, globe, resetGlobe } = require('./globe');
const { addStars } = require('./stars');

const setScene = () => {
    addLight();
    addStars();
    addGlobe();

    // TODO: add to labs
    scene.add(new THREE.WireframeHelper(globe));
    // red: x, green: y, blue: z
    // TODO: add to labs
    scene.add(new THREE.AxisHelper(75));

    on('submitted', resetGlobe);

    getCamera().lookAt(scene.position);
    animate();
};

const animate = () => {
    updateControls(1);
    renderer.render(scene, getCamera());
    window.requestAnimationFrame(animate);
};

module.exports = { renderer, setScene };
