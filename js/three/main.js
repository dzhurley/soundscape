var _ = require('underscore');

var renderer = require('./renderer');
var camera = require('./camera');
var scene = require('./scene');
var light = require('./light');
var Mesh = require('./mesh/main');

var threes = {
    renderer: renderer,
    camera: camera,
    scene: scene,
    light: light,

    init: function() {
        this.mesh = Mesh;
        this.mesh.addToScene();
        this.light.addToScene();

        this.camera.lookAt(scene.position);
    },

    moveCameraToFace: function(evt, face) {
        App.three.camera.position = this.mesh.utils.faceCentroid(face);
        App.three.camera.lookAt(scene.position.multiplyScalar(1.75));
    },

    animate: function() {
        if (this.controls) {
            this.controls.update(1);
        }
        this.renderer.render(this.scene, this.camera);
    }
};

threes.init();

module.exports = threes;
