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

// TODO: helpers.js?
const childWithPrototype = o => scene.children.find(c => c.constructor.prototype === o.prototype);
const toggleChild = child => state => state ? scene.add(child) : scene.remove(child);

const bindHelpers = () => {
    // red: x, green: y, blue: z
    if (isActive('AxisHelper')) scene.add(new AxisHelper(75));
    if (isActive('WireframeHelper')) scene.add(new WireframeHelper(globe));

    on('lab.AxisHelper', toggleChild(childWithPrototype(AxisHelper)));
    on('lab.WireframeHelper', toggleChild(childWithPrototype(WireframeHelper)));
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
