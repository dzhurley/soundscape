define([
    'dispatch',
    'three/main',
    'three/controls',
    'sources/main',
    'artists',
    'hud'
], function(Dispatch, Threes, Controls, Sourcer, ArtistManager, Hud) {
    return function() {
        var app = {
            container: document.getElementById('scape'),
            hudContainer: document.getElementById('hud'),
            sourcesOverlay: document.getElementById('sources-overlay'),
            sourcesButton: document.getElementById('toggleOverlay'),
            controlsButton: document.getElementById('toggleControls'),
            sourcesPrompt: document.getElementById('sources'),

            debugging: true,

            init: function(constants) {
                this.constants = constants || {};
                this.bus = new Dispatch();
                this.three = new Threes();
                this.sourcer = new Sourcer();
                this.artistManager = new ArtistManager();
                this.hud = new Hud();

                this.bindHandlers();
                this.container.appendChild(this.three.renderer.domElement);
                this.focusUsername();

                this.animate();
            },

            focusUsername: function() {
                this.sourcesPrompt.querySelector('#username').focus();
            },

            toggleControls: function() {
                this.three.controls.toggleControls();
            },

            toggleDebugging: function(evt) {
                App.debugging = !App.debugging;
                App.bus.emit('debugging');
            },

            toggleOverlay: function(evt) {
                var classes = this.sourcesOverlay.classList;
                classes.toggle('closed');
                if (!_.contains(classes, 'closed')) {
                    this.focusUsername();
                }
            },

            bindHandlers: function() {
                _.each(document.querySelectorAll('.worker button'), function(button) {
                    button.addEventListener('click', function() {
                        return App.bus.emitOnWorker.call(App.bus, button.id);
                    });
                }.bind(this));

                _.each(document.querySelectorAll('.main button'), function(button) {
                    button.addEventListener(
                        'click', this[button.id].bind(this));
                }.bind(this));

                this.sourcesPrompt.addEventListener(
                    'submit', this.sourcer.checkSource.bind(this.sourcer));

                this.bus.on('submitted', function() {
                    App.three.mesh.resetGlobe();
                    if (_.isUndefined(App.three.controls)) {
                        App.three.controls = new Controls();
                    }
                });
            },

            animate: function() {
                window.requestAnimationFrame(App.animate);
                App.three.animate();
            }
        };

        return app;
    };
});
