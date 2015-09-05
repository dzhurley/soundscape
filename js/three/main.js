'use strict';

/* Meat of the THREE.js integration and rendering loop
 *
 * This also manages the rebinding of fly/orbital controls
 */

let Dispatch = require('../dispatch');

let renderer = require('./renderer');
let camera = require('./camera');
let scene = require('./scene');
let light = require('./light');
let mesh = require('./mesh/main');
let stars = require('./stars');

let threes = {
    camera,

    setScene() {
        light.addToScene();
        mesh.addToScene();
        stars.addToScene();

        this.camera.lookAt(scene.position);
        this.animate();

        Dispatch.on('submitted', () => {
            mesh.resetGlobe();
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
