define([
    'jquery',
    'orbital',
    'renderer',
    'camera',
    'scene',
    'light',
    'mesh',
    'last'
], function($, THREE, renderer, camera, scene, light, mesh, last) {
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    return function() {
        var app = {
            container: $('#scape'),
            last: last,
            mesh: mesh,
            spin: true,

            toggleSpin: function() {
                this.spin = this.spin ? false : true;
            },

            init: function() {
                this.container.append(renderer.domElement);
                mesh.addToScene();
                light.addToScene();

                this.animate();
                this.last.getArtists();
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                camera.onRender(scene, {
                    spin: app.spin
                });
                controls.update();
                renderer.render(scene, camera);
            }
        };

        return app;
    };
});
