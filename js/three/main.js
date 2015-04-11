'use strict';

let Dispatch = require('../dispatch');

let renderer = require('./renderer');
let camera = require('./camera');
let scene = require('./scene');
let light = require('./light');
let mesh = require('./mesh/main');

let threes = {
    camera,
    light,
    mesh,
    renderer,
    scene,

    setScene() {
        this.light.addToScene();
        this.mesh.addToScene();

        this.camera.lookAt(scene.position);
        this.animate();

        Dispatch.on('submitted', () => {
            this.mesh.resetGlobe();
            if (!this.controls) {
                this.controls = require('./controls');
            }
        });
    },

    animate() {
        if (threes.controls) threes.controls.update(1);
        threes.renderer.render(threes.scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
