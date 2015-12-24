'use strict';

const { AmbientLight } = require('three');
const { light } = require('../constants');
const scene = require('./scene');

module.exports = {
    addLight() {
        scene.add(new AmbientLight(light.color));
    }
};
