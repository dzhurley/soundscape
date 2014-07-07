define([
    'underscore',
    './renderer',
    './camera',
    './scene',
    './controls',
    './light',
    './mesh'
], function(_, renderer, camera, scene, controls, light, mesh) {
    return function() {
        var threes = {
            renderer: renderer,
            camera: camera,
            scene: scene,
            controls: controls,
            light: light,
            mesh: mesh,

            init: function() {
                this.mesh.addToScene();
                this.light.addToScene();

                this.controls.bindControls();
                this.camera.lookAt(scene.position);

                App.vent.on('painted.face', _.bind(this.moveCameraToFace, this));
            },

            moveCameraToFace: function(evt, face) {
                App.three.camera.position = face.centroid.multiplyScalar(1.75);;
                App.three.camera.lookAt(scene.position);
            },

            animate: function() {
                this.controls.update(1);
                this.renderer.render(this.scene, this.camera);
            }
        };

        threes.init();
        return threes;
    };
});
