'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const THREE = require('three');
const { on } = require('../dispatch');

const camera = require('./camera');
const { addLight } = require('./light');
const renderer = require('./renderer');
const scene = require('./scene');

const globe = require('./globe');
const { addStars } = require('./stars');

let threes = {
    camera,
    renderer,

    setScene() {
        addLight();
        addStars();

        globe.addToScene();

        // TODO: add to labs
        scene.add(new THREE.WireframeHelper(globe));
        // red: x, green: y, blue: z
        // TODO: add to labs
        scene.add(new THREE.AxisHelper(75));

        this.camera.lookAt(scene.position);
        this.animate();

        on('submitted', () => {
            globe.resetGlobe();
            if (!this.controls) {
                this.controls = require('./controls');
            }
        });
    },

    animate() {
        if (threes.controls) threes.controls.updateControls(1);
        renderer.render(scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
