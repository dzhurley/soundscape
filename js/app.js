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

            showHeadsUp: true,

            init: function() {
                this.vent = new EventBus();
                this.three = new Threes();
                this.processor = new Processor();
                this.headsUp = new HeadsUp();

                this.$container.append(this.three.renderer.domElement);
                this.animate();

                this.last = new Last();
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.showHeadsUp ? app.$headsUp.show() : app.$headsUp.hide();
                app.three.animate();
            }
        };

        return app;
    };
});
