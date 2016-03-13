'use strict';

const Worker = require('worker!./worker');

const { sources } = require('./constants');
const { setMainWorker } = require('./dispatch');
const { renderer, setScene } = require('./three/main');
const { registerSources } = require('./sources/main');
const { attachWebGLement } = require('./dom');

setMainWorker(new Worker());

registerSources(sources);

setScene();

attachWebGLement(renderer.domElement);
