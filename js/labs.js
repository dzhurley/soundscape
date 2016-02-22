'use strict';

const events = require('./events');
const { emit, once } = require('./dispatch');

let labs = {
    devTools: {
        iterateControl: {
            trigger: '',
            value: true
        }
    },
    experiments: {
        forceSeeding: {
            trigger: 'submitted',
            value: false
        }
    }
};

// keep history of when events have been triggered
// TODO: move to events.js?
let triggered = {};
events.map(e => triggered[e] = false);
events.map(e => once(e, () => {
    triggered[e] = true;

    // notify matching labs that event has triggered
    // TODO: currently only in main thread, is that enough?
    Object.keys(labs).map(t => {
        Object.keys(labs[t])
            .filter(k => labs[t][k].trigger === e)
            .map(l => emit('triggered', l));
    });
}));

// use event history to check lab status if needed
const isActive = (key, type) => {
    let lab = labs[type][key];
    return lab.trigger && lab.value ? triggered[lab.trigger] : lab.value;
};

// trigger hasn't fired yet
const isPending = (key, type) => labs[type][key].value && !triggered[labs[type][key].trigger];

// still bound by trigger if present, returns lab
const activate = (key, type) => labs[type][key].value = true;

const deactivate = (key, type) => labs[type][key].value = false;

const toggleLab = (key, type) => isActive(key, type) || isPending(key, type) ?
    deactivate(key, type) :
    activate(key, type);

const currentLabs = () => Object.assign({}, labs);

module.exports = { activate, currentLabs, deactivate, isActive, isPending, toggleLab };
