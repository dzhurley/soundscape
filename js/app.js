require('es6-shim');

var _ = require('underscore');
var work = require('webworkify');
var worker = work(require('./worker'));

var Dispatch = require('./dispatch');
var Threes = require('./three/main');
var Controls = require('./three/controls');
var Sourcer = require('./sources/main');

var Hud = require('./hud');
var DOM = require('./dom');

class App {
    constructor() {
        this.bindHandlers();
        this.hud = Hud.bind(DOM.container);

        Threes.setupScene();
        DOM.container.appendChild(Threes.renderer.domElement);
    }

    bindHandlers() {
        DOM.bind();

        Dispatch.on('submitting', Sourcer.checkSource.bind(Sourcer));
        Dispatch.on('submitted', () => {
            Threes.mesh.resetGlobe();
            if (_.isUndefined(Threes.controls)) {
                Threes.controls = new Controls();
            }
        });

        Dispatch.bindToWorker(worker);
    }
};

new App();
