define([
    'eventbus',
    'three/main',
    'three/controls',
    'plotting/main',
    'sources/main',
    'headsUp'
], function(EventBus, Threes, Controls, Plotter, Sourcer, HeadsUp) {
    return function() {
        var app = {
            container: document.getElementById('scape'),
            headsUpDisplay: document.getElementById('heads-up'),
            sourcesOverlay: document.getElementById('sources-overlay'),
            sourcesButton: document.getElementById('toggle-overlay'),
            sourcesPrompt: document.getElementById('sources'),
            debuggingButton: document.getElementById('toggle-debugging'),
            controlsButton: document.getElementById('toggle-controls'),

            debugging: true,

            init: function(constants) {
                this.constants = constants || {};
                this.vent = new EventBus();
                this.three = new Threes();
                this.plotter = new Plotter();
                this.sourcer = new Sourcer();
                this.headsUp = new HeadsUp();

                this.bindHandlers();
                this.container.appendChild(this.three.renderer.domElement);
                this.animate();
            },

            toggleDebugging: function() {
                this.three.mesh.toggleDebugging();
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

            bindHandlers: function() {
                // ux events to listen on for state changes
                this.debuggingButton.addEventListener(
                    'click',
                    this.toggleDebugging.bind(this)
                );
                this.controlsButton.addEventListener(
                    'click',
                    this.toggleControls.bind(this)
                );
                this.sourcesPrompt.addEventListener(
                    'submit',
                    this.sourcer.checkSource.bind(this.sourcer)
                );
                this.sourcesButton.addEventListener(
                    'click',
                    this.toggleSources.bind(this)
                );
                this.focusUsername();

                this.vent.on('submitted', function() {
                    App.three.mesh.resetGlobe();
                    if (_.isUndefined(App.three.controls)) {
                        App.three.controls = new Controls();
                    }
                });
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.three.animate();
            }
        };

        return app;
    };
});
