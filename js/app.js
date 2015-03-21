var _ = require('underscore');
var work = require('webworkify');
var worker = work(require('./worker'));

var Dispatch = require('./dispatch');
var Constants = require('./constants');
var Threes = require('./three/main');
var Controls = require('./three/controls');
var Sourcer = require('./sources/main');

var Hud = require('./hud');
var DOM = require('./dom');

var App = {
    init: function(constants) {
        this.bindHandlers();
        this.hud = Hud.bind(DOM.container);
        DOM.container.appendChild(Threes.renderer.domElement);
        this.animate();
    },

    bindHandlers: function() {
        DOM.bind();

        Dispatch.on('submitting', Sourcer.checkSource.bind(Sourcer));
        Dispatch.on('submitted', () => {
            Threes.mesh.resetGlobe();
            if (_.isUndefined(Threes.controls)) {
                Threes.controls = new Controls();
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
