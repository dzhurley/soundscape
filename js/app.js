define([
    'jquery',
    'orbital',
    'renderer',
    'camera',
    'scene',
    'light',
    'mesh',
    'last',
    'headsUp'
], function($, THREE, renderer, camera, scene, light, mesh, last, headsUp) {
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    return function() {
        var app = {
            $container: $('#scape'),
            $headsUp: $('#heads-up'),
            last: last,
            mesh: mesh,

            spin: false,
            showHeadsUp: true,
            debug: true,

            bindOptions: function() {
                $(document).keydown(_.bind(function(evt) {
                    switch (evt.keyCode) {
                        case 83: // 's'
                            this.spin = this.spin ? false : true;
                            break;
                        case 84: // 't'
                            this.showHeadsUp = this.showHeadsUp ? false : true;
                            break;
                    }
                }, this));
            },

            init: function() {
                this.$container.append(renderer.domElement);
                this.bindOptions();
                mesh.addToScene();
                light.addToScene();

                this.animate();
                this.last.getArtists();
                headsUp.bindHeadsUp();

                if (this.debug) {
                    this.exposeTHREE();
                }
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                camera.onRender(scene, { spin: app.spin });
                app.showHeadsUp ? app.$headsUp.show() : app.$headsUp.hide();
                controls.update();
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
