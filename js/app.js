define([
    'eventbus',
    'three/main',
    'three/controls',
    'processing/main',
    'sources/main',
    'headsUp'
], function(EventBus, Threes, Controls, Processor, Sourcer, HeadsUp) {
    return function() {
        var app = {
            container: document.getElementById('scape'),
            headsUpDisplay: document.getElementById('heads-up'),
            sourcesOverlay: document.getElementById('sources-overlay'),
            sourcesButton: document.getElementById('toggle-overlay'),
            sourcesPrompt: document.getElementById('sources'),
            outlinesButton: document.getElementById('toggle-outlines'),

            outlines: true,
            painting: false,
            stopLooping: false,
            stopOnSwap: true,

            init: function() {
                this.vent = new EventBus();
                this.three = new Threes();
                this.processor = new Processor();
                this.sourcer = new Sourcer();
                this.headsUp = new HeadsUp();

                this.bindHandlers();
                this.container.appendChild(this.three.renderer.domElement);
                this.setupWorkers();
                this.animate();
            },

            setupWorkers: function() {
                this.worker = new Worker('js/worker.js');
                this.worker.postMessage('start');

                this.worker.onerror = function() {
                    console.error('Worker Error:', arguments);
                };

                this.worker.onmessage = function(evt) {
                    console.warn(evt.data);
                };
            },

            toggleOutlines: function() {
                if (this.outlines) {
                    this.three.scene.remove(this.three.mesh.outlines);
                    this.outlines = false;
                    this.worker.postMessage({
                        faces: this.three.mesh.getFaces(),
                        vertices: this.three.mesh.getVertices()
                    });
                } else {
                    this.three.scene.add(this.three.mesh.outlines);
                    this.outlines = true;
                    this.worker.postMessage('outlines are on!');
                }
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

            bindHandlers: function() {
                this.outlinesButton.addEventListener(
                    'click',
                    _.bind(this.toggleOutlines, this)
                );
                this.sourcesPrompt.addEventListener(
                    'submit',
                    _.bind(this.sourcer.checkSource, this.sourcer)
                );
                this.sourcesButton.addEventListener(
                    'click',
                    _.bind(this.toggleSources, this)
                );
                this.focusUsername();

                this.vent.on('seeded', function() {
                    App.painting = true;
                });
                this.vent.on('starting.source', function() {
                    App.three.mesh.resetGlobe();
                    if (_.isUndefined(App.three.controls)) {
                        App.three.controls = new Controls();
                        App.three.controls.bindControls();
                    }
                });
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.three.animate();
                if (app.painting && !app.stopLooping) {
                    app.processor.processBatch();
                }
            }
        };

        return app;
    };
});
