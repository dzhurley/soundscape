define([
    'jquery',
    'eventbus',
    'fly',
    'three/main',
    'processing/main',
    'last',
    'headsUp'
], function($, EventBus, THREE, Threes, Processor, Last, HeadsUp) {
    return function() {
        var app = {
            $container: $('#scape'),
            $headsUp: $('#heads-up'),
            $toggleOutlines: $('#toggle-outlines'),

            outlines: true,
            painting: false,
            stopLooping: false,
            stopOnSwap: true,

            init: function() {
                this.vent = new EventBus();
                this.three = new Threes();
                this.processor = new Processor();
                this.headsUp = new HeadsUp();

                this.$container.append(this.three.renderer.domElement);
                this.bindHandlers();
                this.setupWorkers();
                this.animate();

                this.last = new Last();
            },

            setupWorkers: function() {
                this.worker = new Worker('js/worker.js');
                this.worker.postMessage('start');
                this.worker.onmessage = function(evt) {
                    console.warn(evt.data);
                };
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.three.animate();
                if (app.painting && !app.stopLooping) {
                    app.processor.processBatch();
                }
            },

            toggleOutlines: function() {
                if (this.outlines) {
                    this.three.scene.remove(this.three.mesh.outlines);
                    this.outlines = false;
                    this.worker.postMessage('outlines are off!');
                } else {
                    this.three.scene.add(this.three.mesh.outlines);
                    this.outlines = true;
                    this.worker.postMessage('outlines are on!');
                }
            },

            bindHandlers: function() {
                this.$toggleOutlines.click(_.bind(this.toggleOutlines, this));
                this.vent.on('seeded', function() {
                    App.painting = true;
                });
            }
        };

        return app;
    };
});
