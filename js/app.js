define([
    'eventEmitter',
    'three/main',
    'three/controls',
    'plotting/main',
    'sources/main',
    'artists',
    'hud'
], function(EventEmitter, Threes, Controls, Plotter, Sourcer, ArtistManager, Hud) {
    return function() {
        var app = {
            container: document.getElementById('scape'),
            hudContainer: document.getElementById('hud'),
            sourcesOverlay: document.getElementById('sources-overlay'),
            sourcesButton: document.getElementById('toggle-overlay'),
            sourcesPrompt: document.getElementById('sources'),

            debuggingButton: document.getElementById('toggle-debugging'),
            controlsButton: document.getElementById('toggle-controls'),
            oneArtistButton: document.getElementById('one-artist'),
            oneBatchButton: document.getElementById('one-batch'),
            allBatchButton: document.getElementById('all-batch'),

            debugging: true,

            init: function(constants) {
                this.constants = constants || {};
                this.bus = new EventEmitter();
                this.three = new Threes();
                this.plotter = new Plotter();
                this.sourcer = new Sourcer();
                this.artistManager = new ArtistManager();
                this.hud = new Hud();

                this.bindHandlers();
                this.container.appendChild(this.three.renderer.domElement);
                this.animate();
            },

            toggleControls: function() {
                this.three.controls.toggleControls();
            },

            focusUsername: function() {
                this.sourcesPrompt.querySelector('#username').focus();
            },

            toggleSources: function(evt) {
                var classes = this.sourcesOverlay.classList;
                classes.toggle('closed');
                if (!_.contains(classes, 'closed')) {
                    this.focusUsername();
                }
            },

            // TODO: improve binding sitch
            bindHandlers: function() {
                // ux events to listen on for state changes
                this.debuggingButton.addEventListener('click', function() {
                    App.debugging = !App.debugging;
                    App.bus.emit('debugging', App.debugging);
                });

                this.controlsButton.addEventListener(
                    'click', this.toggleControls.bind(this));

                this.oneArtistButton.addEventListener('click', function() {
                    App.plotter.postMessage({ msg: 'oneArtist' });
                }.bind(this));

                this.oneBatchButton.addEventListener('click', function() {
                    App.plotter.postMessage({ msg: 'batchOnce' });
                }.bind(this));

                this.allBatchButton.addEventListener('click', function() {
                    App.plotter.postMessage({ msg: 'batch' });
                }.bind(this));

                this.sourcesPrompt.addEventListener(
                    'submit', this.sourcer.checkSource.bind(this.sourcer));

                this.sourcesButton.addEventListener(
                    'click', this.toggleSources.bind(this));

                this.focusUsername();

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
