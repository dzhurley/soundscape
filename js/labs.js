'use strict';

const { labs } = require('./constants');
const events = require('./events');
const { emit, on } = require('./dispatch');

// take frozen values from constants and store locally as mutable array
let labStore = window.labStore = labs.map(lab => Object.assign({}, lab));

const labForName = name => labStore.find(l => l.name === name);

// keep history of when events have been triggered
// TODO: move to events.js?
let triggered = {};
const resetTriggered = () => events.map(e => triggered[e] = false);

// start false on init and reset
resetTriggered();
on('labReset', resetTriggered);

// notify matching labs that event has triggered
events.map(e => on(e, () => {
    triggered[e] = true;
    labStore.filter(l => l.trigger === e).map(l => emit('triggered', l));
}));

// use event history to check lab status if needed
const isActive = name => {
    let lab = labForName(name);
    return lab.trigger && lab.value ? triggered[lab.trigger] : lab.value;
};

// trigger hasn't fired yet
const isPending = name => {
    let lab = labForName(name);
    return lab.value && (!!lab.trigger && !triggered[lab.trigger]);
};

// still bound by trigger if present, returns lab
const setLab = value => name => {
    let lab = labForName(name);
    lab.value = value;
    lab.reset && emit('labReset');
};
const activate = setLab(true);
const deactivate = setLab(false);

const toggleLab = name => isActive(name) || isPending(name) ? deactivate(name) : activate(name);

const currentLabs = () => Array.from(labStore);

module.exports = { activate, currentLabs, deactivate, isActive, isPending, toggleLab };
