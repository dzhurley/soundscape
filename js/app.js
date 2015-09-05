'use strict';

require('es6-shim');

let work = require('webworkify');
let worker = work(require('./worker'));

let Dispatch = require('./dispatch');
let Threes = require('./three/main');
let renderer = require('./three/renderer');
let DOM = require('./dom');
let HUD = require('./hud');

Dispatch.bindToWorker(worker);

Threes.setScene();

DOM.attachTo(renderer.domElement);

HUD.attachTo(DOM.container);
