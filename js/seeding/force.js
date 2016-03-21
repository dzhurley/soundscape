'use strict';

/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

const { globe: { radius }, normalMax } = require('../constants');
const { force: { epsilon, maxIterations, initialTemp } } = require('../constants');

let temp = initialTemp;
let iterations = 0;
let nodes = new Set();

const repulse = (vCharge, uCharge, distance) => distance / vCharge * uCharge;

const applyDiff = (v, u) => {
    // diff is the difference vector between the positions of the two vertices
    let diff = v.position.clone().sub(u.position);
    let length = diff.length();

    if (length <= v.charge) {
        let multiplier = repulse(v.charge, u.charge, length);
        v.position.add(diff.multiplyScalar(multiplier));
        // bind to surface of globe
        v.position.setLength(radius);
    }
};

const iterateForce = () => {
    if (iterations < maxIterations && temp > epsilon) {
        for (let v of nodes) {
            for (let u of nodes) {
                if (u.name === v.name) continue;
                applyDiff(v, u);
            }
        }

        temp *= 1 - iterations / maxIterations;
        iterations++;
        return false;
    }
    console.log('forces stable');
    return true;
};

const startForce = ns => {
    // normalize charges between 0 and normalMax
    let maxCharge = Math.max(...Array.from(ns).map(n => n.charge));
    ns.forEach(n => n.charge = normalMax * (n.charge / maxCharge));
    nodes = ns;
};

module.exports = { startForce, iterateForce };
