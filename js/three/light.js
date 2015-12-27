'use strict';

const { AmbientLight } = require('three');
const { light } = require('../constants');
const scene = require('./scene');

const addLight = () => scene.add(new AmbientLight(light.color));

module.exports = { addLight };
