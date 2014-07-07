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
            $paintFace: $('#paint-face'),

            stopLooping: false,
            stopOnSwap: true,

            init: function() {
                this.vent = new EventBus();
                this.three = new Threes();
                this.processor = new Processor();
                this.headsUp = new HeadsUp();

                this.$container.append(this.three.renderer.domElement);
                this.bindHandlers();
                this.animate();

                this.last = new Last();
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.three.animate();
            },

            bindHandlers: function() {
                this.$paintFace.click(_.bind(this.processOne, this));
            },

            processOne: function() {
                if (this.stopLooping) {
                    return false;
                }
                this.processor.looper.loopOnce(this.remaining);
                this.three.mesh.update();
            }
        };

        return app;
    };
});
