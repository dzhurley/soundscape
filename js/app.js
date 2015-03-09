var _ = require('underscore');

var Dispatch = require('./dispatch');
var Threes = require('./three/main');
var Sourcer = require('./sources/main');
var ArtistManager = require('./artists');
var Hud = require('./hud');

var App = {
    container: document.getElementById('scape'),
    hudContainer: document.getElementById('hud'),
    sourcesOverlay: document.getElementById('sources-overlay'),
    sourcesButton: document.getElementById('toggleOverlay'),
    controlsButton: document.getElementById('toggleControls'),
    sourcesPrompt: document.getElementById('sources'),

    debugging: true,

    init: function(constants) {
        this.hud = Hud.bind(this.container);

        this.bindHandlers();
        this.container.appendChild(Threes.renderer.domElement);
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
                // TODO too specific
                return App.bus.emitOnWorker.call(App.bus, 'plot.' + button.id);
            });
        }.bind(this));

        _.each(document.querySelectorAll('.main button'), function(button) {
            button.addEventListener(
                'click', this[button.id].bind(this));
        }.bind(this));

        this.sourcesPrompt.addEventListener(
            'submit', Sourcer.checkSource.bind(this.sourcer));

            Dispatch.on('submitted', function() {
                App.three.mesh.resetGlobe();
                if (_.isUndefined(App.three.controls)) {
                    App.three.controls = new Controls();
                }
            });
    },

    animate: function() {
        window.requestAnimationFrame(App.animate);
        Threes.animate();
    }
};

App.init();
module.exports = App;
