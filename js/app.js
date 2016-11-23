const Worker = require('worker!worker');

const { sources } = require('constants');
const { setMainWorker } = require('dispatch');
const { renderer, setScene } = require('three/main');
const { registerSources } = require('sources/main');
const { bindEvents } = require('dom');

setMainWorker(new Worker());

registerSources(sources);

setScene();

bindEvents(renderer.domElement);

global.debug = require('debugger');
