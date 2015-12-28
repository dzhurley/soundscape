'use strict';

const { experiments } = require('./constants');

let activeExperiments = Object.assign({}, experiments);

const activate = ex => activeExperiments[ex] = true;
const deactivate = ex => activeExperiments[ex] = false;
const isActive = ex => activeExperiments[ex];

module.exports = { activate, deactivate, isActive };
