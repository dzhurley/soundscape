'use strict';

const events = require('./events');
const { emit, once } = require('./dispatch');

let labs = [
    {
        name: 'forceSeeding',
        trigger: 'submitted',
        value: false
    },
    {
        name: 'iterateControl',
        trigger: '',
        value: true
    }
];

const labForName = name => labs.find(l => l.name === name);

// keep history of when events have been triggered
// TODO: move to events.js?
let triggered = {};
events.map(e => triggered[e] = false);
events.map(e => once(e, () => {
    triggered[e] = true;
    // notify matching labs that event has triggered
    labs.filter(l => l.trigger === e).map(l => emit('triggered', l));
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
const activate = name => labForName(name).value = true;
const deactivate = name => labForName(name).value = false;
const toggleLab = name => isActive(name) || isPending(name) ? deactivate(name) : activate(name);

const currentLabs = () => Array.from(labs);

module.exports = { activate, currentLabs, deactivate, isActive, isPending, toggleLab };
