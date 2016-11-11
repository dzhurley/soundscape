const Worker = require('worker!worker');

const { sources } = require('constants');
const { setMainWorker } = require('dispatch');
const { renderer, setScene } = require('three/main');
const { registerSources } = require('sources/main');
const { attachWebGLement } = require('dom');

const { debug } = require('debugger');

setMainWorker(new Worker());

registerSources(sources);

setScene();

attachWebGLement(renderer.domElement);

global.debug = debug;
