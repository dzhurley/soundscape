var _ = require('underscore');
var work = require('webworkify');
var worker = work(require('./worker'));

var Dispatch = require('./dispatch');
var Threes = require('./three/main');
var Controls = require('./three/controls');
var Sourcer = require('./sources/main');
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
        Dispatch.emit('debugging');
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
                return Dispatch.emitOnWorker.call(Dispatch, 'plot.' + button.id);
            });
        }.bind(this));

        _.each(document.querySelectorAll('.main button'), function(button) {
            button.addEventListener(
                'click', this[button.id].bind(this));
        }.bind(this));

        this.sourcesPrompt.addEventListener(
            'submit', Sourcer.checkSource.bind(Sourcer));

        Dispatch.on('submitted', function() {
            Threes.mesh.resetGlobe();
            if (_.isUndefined(Threes.controls)) {
                Threes.controls = Controls;
            }
        });

        Dispatch.bindToWorker(worker);
    },

    animate: function() {
        window.requestAnimationFrame(App.animate);
        Threes.animate();
    }
};

module.exports = App;
