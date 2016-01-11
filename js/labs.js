'use strict';

const { devTools, experiments } = require('./constants');

let active = window.active = {
    devTools: Object.assign({}, devTools),
    experiments: Object.assign({}, experiments)
};

const activate = (ex, key) => active[key][ex] = true;
const deactivate = (ex, key) => active[key][ex] = false;
const isActive = (ex, key) => active[key][ex];

module.exports = { activate, deactivate, isActive };
