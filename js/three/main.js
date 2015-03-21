var _ = require('underscore');

var renderer = require('./renderer');
var camera = require('./camera');
var scene = require('./scene');
var light = require('./light');
var mesh = require('./mesh/main');

var threes = {
    camera,
    light,
    mesh,
    renderer,
    scene,

    setupScene() {
        this.light.addToScene();
        this.mesh.addToScene();

        this.camera.lookAt(scene.position);
        this.animate();
    },

    animate() {
        threes.controls && threes.controls.update(1);
        threes.renderer.render(threes.scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
