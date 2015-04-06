require('es6-shim');

let work = require('webworkify');
let worker = work(require('./worker'));

let Dispatch = require('./dispatch');
let Threes = require('./three/main');
let Controls = require('./three/controls');
let Sourcer = require('./sources/main');

let HUD = require('./hud');
let DOM = require('./dom');

class App {
    constructor() {
        this.bindHandlers();

        Threes.setupScene();
        DOM.container.appendChild(Threes.renderer.domElement);
    }

    bindHandlers() {
        DOM.bind();

        Dispatch.on('submitting', Sourcer.checkSource.bind(Sourcer));
        Dispatch.on('submitted', () => {
            Threes.mesh.resetGlobe();
            if (!Threes.controls) {
                Threes.controls = new Controls();
            }
        });

        Dispatch.bindToWorker(worker);
    }
};

new App();
