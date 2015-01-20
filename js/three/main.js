define([
    'underscore',
    'three/renderer',
    'three/camera',
    'three/scene',
    'three/light',
    'three/mesh/main'
], function(_, renderer, camera, scene, light, Mesh) {
    return function() {
        var threes = {
            renderer: renderer,
            camera: camera,
            scene: scene,
            light: light,

            init: function() {
                this.mesh = new Mesh();
                this.mesh.addToScene();
                this.light.addToScene();

                this.camera.lookAt(scene.position);
            },

            moveCameraToFace: function(evt, face) {
                App.three.camera.position = new THREE.Vector3()
                    .addVectors(face.a, face.b, face.c)
                    .divideScalar(3)
                    .multiplyScalar(1.75);
                App.three.camera.lookAt(scene.position);
            },

            animate: function() {
                if (this.controls) {
                    this.controls.update(1);
                }
                this.renderer.render(this.scene, this.camera);
            }
        };

        threes.init();
        return threes;
    };
});
