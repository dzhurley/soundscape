'use strict';

const { devTools, experiments } = require('./constants');
const events = require('./events');
const { once } = require('./dispatch');

let active = {
    devTools: Object.assign({}, devTools),
    experiments: Object.assign({}, experiments)
};

// keep history of when events have been triggered
// TODO: move to events.js?
let triggered = {};
events.map(e => triggered[e] = false);
events.map(e => once(e, () => triggered[e] = true));

// use event history to check active status if needed
const isActive = (key, type) => {
    let lab = active[type][key];
    return lab.trigger && lab.value ? triggered[lab.trigger] : lab.value;
};

// still bound by trigger if present
const activate = (key, type) => active[type][key].value = true;
const deactivate = (key, type) => active[type][key].value = false;

module.exports = { activate, deactivate, isActive };
