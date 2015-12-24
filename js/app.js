'use strict';

const Worker = require('worker!./worker');

const { addWorker } = require('./dispatch');
const Threes = require('./three/main');
const { registerSources } = require('./sources/main');
const { attachWebGLement } = require('./dom');

addWorker(new Worker());

Threes.setScene();

// TODO: constants
registerSources(['lastfm']);

attachWebGLement(Threes.renderer.domElement);
