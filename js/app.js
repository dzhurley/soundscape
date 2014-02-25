define([
    'jquery',
    'fly',
    'renderer',
    'camera',
    'scene',
    'controls',
    'light',
    'mesh',
    'last',
    'headsUp'
], function($, THREE, renderer, camera, scene, controls, light, mesh, last, headsUp) {
    return function() {
        var app = {
            $container: $('#scape'),
            $headsUp: $('#heads-up'),
            last: last,
            mesh: mesh,

            // TODO: dat.gui
            spin: false,
            showHeadsUp: true,
            debug: true,

            init: function() {
                this.$container.append(renderer.domElement);
                mesh.addToScene();
                light.addToScene();

                this.animate();
                this.last.getArtists();
                headsUp.bindHeadsUp();
                controls.bindControls();

                if (this.debug) {
                    this.exposeTHREE();
                }
                camera.lookAt(scene.position);
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.showHeadsUp ? app.$headsUp.show() : app.$headsUp.hide();
                controls.update(1);
                renderer.render(scene, camera);
            },

            exposeTHREE: function() {
                this.renderer = renderer,
                this.camera = camera,
                this.scene = scene,
                this.light = light,
                this.headsUp = headsUp,
                this.controls = controls;
            }
        };

        return app;
    };
});
