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
            sourcerButton: document.getElementById('toggle-overlay'),
            sourcerPrompt: document.getElementById('sources'),
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

            toggleSources: function(evt) {
                evt.target.parentNode.classList.toggle('closed');
            },

            bindHandlers: function() {
                this.outlinesButton.addEventListener(
                    'click',
                    _.bind(this.toggleOutlines, this)
                );
                this.sourcerPrompt.addEventListener(
                    'submit',
                    _.bind(this.sourcer.checkSource, this.sourcer)
                );
                this.sourcerButton.addEventListener(
                    'click',
                    _.bind(this.toggleSources, this)
                );

                this.vent.on('seeded', function() {
                    App.painting = true;
                });
                this.vent.on('starting.source', function() {
                    App.three.mesh.resetGlobe();
                    if (_.isUndefined(App.three.controls)) {
                        // TODO: solve clickjack better, maybe
                        // using something like headsUp
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
