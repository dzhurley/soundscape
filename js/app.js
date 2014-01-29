define([
    'jquery',
    'orbital',
    'renderer',
    'camera',
    'scene',
    'light',
    'mesh'
], function($, THREE, renderer, camera, scene, light, mesh) {
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    return function() {
        var app = {
            container: $('#scape'),

            init: function() {
                this.draw();
                this.animate();
            },

            draw: function() {
                this.container.append(renderer.domElement);
                scene.add(mesh);
                scene.add(light.ambient);
                scene.add(light.directional);
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                renderer.render(scene, camera);
                mesh.rotation.y -= 0.01;
                controls.update();
            }
        };

        return app;
    };
});
