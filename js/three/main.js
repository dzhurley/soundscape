'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

const THREE = require('three');
const Dispatch = require('../dispatch');

const camera = require('./camera');
const light = require('./light');
const renderer = require('./renderer');
const scene = require('./scene');

const globe = require('./globe');
const stars = require('./stars');

let threes = {
    camera,
    renderer,

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
        if (window.seedGraph && window.seedGraph.generate()) {
            // Update position of lines (edges)
            for (let i = 0; i < window.seedGeometries.length; i++) {
                window.seedGeometries[i].verticesNeedUpdate = true;
            }
        }
        renderer.render(scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
