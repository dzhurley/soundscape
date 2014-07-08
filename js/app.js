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
            $paintFace: $('#paint-face'),
            $paintSwap: $('#paint-swap'),

            outlines: false,
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
                this.$paintFace.click(_.bind(function() {
                    if (this.stopLooping) {
                        return false;
                    }
                    this.processor.looper.loopOnce(this.remaining);
                    this.three.mesh.update();
                }, this));

                this.$paintSwap.click(_.bind(function() {
                    this.processor.looper.loopOnce(this.remaining, true);
                    this.three.mesh.update();
                }, this));

                this.$toggleOutlines.click(_.bind(function() {
                    if (this.outlines) {
                        this.three.scene.remove(this.three.mesh.outlines);
                        this.outlines = false;
                    } else {
                        this.three.scene.add(this.three.mesh.outlines);
                        this.outlines = true;
                    }
                }, this));
            }
        };

        return app;
    };
});
