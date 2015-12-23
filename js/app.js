'use strict';

const Worker = require('worker!./worker');

const { addWorker } = require('./dispatch');
const Threes = require('./three/main');
const Sourcer = require('./sources/main');
const { Container, attachWebGLement } = require('./dom');
const HUD = require('./hud');

addWorker(new Worker());

Threes.setScene();

Sourcer.addSources(['lastfm']);

attachWebGLement(Threes.renderer.domElement);

HUD.attachTo(Container);
