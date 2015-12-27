'use strict';

const Worker = require('worker!./worker');

const { addWorker } = require('./dispatch');
const { renderer, setScene } = require('./three/main');
const { registerSources } = require('./sources/main');
const { attachWebGLement } = require('./dom');

addWorker(new Worker());

setScene();

// TODO: constants
registerSources(['lastfm']);

attachWebGLement(renderer.domElement);
