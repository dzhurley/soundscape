'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

let THREE = require('three');
let Dispatch = require('../dispatch');

let camera = require('./camera');
let light = require('./light');
let renderer = require('./renderer');
let scene = require('./scene');

let globe = require('./globe');
let stars = require('./stars');

let threes = {
    camera,

    setScene() {
        light.addToScene();

        globe.addToScene();
        stars.addToScene();

        // TODO: flag for optional debugging mode?
        scene.add(new THREE.WireframeHelper(globe));

        this.camera.lookAt(scene.position);
        this.animate();

        Dispatch.on('submitted', () => {
            globe.resetGlobe();
            if (!this.controls) {
                this.controls = require('./controls');
            }
        });
    },

    animate() {
        if (threes.controls) threes.controls.update(1);
        renderer.render(scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
