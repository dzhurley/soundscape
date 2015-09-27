'use strict';

let Worker = require('worker!./worker');

let Dispatch = require('./dispatch');
let Threes = require('./three/main');
let Sourcer = require('./sources/main');
let DOM = require('./dom');
let HUD = require('./hud');

Dispatch.bindToWorker(new Worker());

Threes.setScene();

Sourcer.addSources(['lastfm']);

DOM.attachTo(Threes.renderer.domElement);

HUD.attachTo(DOM.container);
