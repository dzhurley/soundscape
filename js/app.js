'use strict';

const Worker = require('worker!./worker');

const Dispatch = require('./dispatch');
const Threes = require('./three/main');
const Sourcer = require('./sources/main');
const DOM = require('./dom');
const HUD = require('./hud');

Dispatch.bindToWorker(new Worker());

Threes.setScene();

Sourcer.addSources(['lastfm']);

DOM.attachTo(Threes.renderer.domElement);

HUD.attachTo(DOM.container);
