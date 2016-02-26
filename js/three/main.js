'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const { AxisHelper, WireframeHelper } = require('three');
const { on } = require('../dispatch');
const { isActive } = require('../labs');

const { getCamera } = require('./camera');
const { addLight } = require('./light');
const renderer = require('./renderer');
const scene = require('./scene');
const { updateControls } = require('./controls');

const { addGlobe, globe, resetGlobe } = require('./globe');
const { addStars } = require('./stars');

const { iterateForce } = require('../seeding/force');

const setScene = () => {
    addLight();
    addStars();
    addGlobe();

    scene.add(new WireframeHelper(globe));
    // red: x, green: y, blue: z
    scene.add(new AxisHelper(75));

    on('submitted', resetGlobe);
    on('labReset', resetGlobe);

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
