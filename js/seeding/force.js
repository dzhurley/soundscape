/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

const { globe: { radius } } = require('constants');
const { force: { epsilon, maxIterations, initialTemp } } = require('constants');

let temp = initialTemp;
let iterations = 0;
let nodes = new Set();

// checked in render cycle to start/stop calling iterateForce
let iterable = false;
const iterating = () => iterable;

const repulse = (vCharge, uCharge, distance) => distance / vCharge * uCharge;

const applyDiff = (v, u) => {
    // diff is the difference vector between the positions of the two vertices
    let diff = v.position.clone().sub(u.position);
    let length = diff.length();

    if (length <= v.charge) {
        let multiplier = repulse(v.charge, u.charge, length);
        v.position.add(diff.multiplyScalar(multiplier * 0.001));
        // bind to surface of globe
        v.position.setLength(radius);
    }
};

const iterateForce = () => {
    if (iterations >= maxIterations || temp <= epsilon) {
        console.log('forces stable');
        iterable = false;
        return;
    }

    for (let v of nodes) {
        for (let u of nodes) {
            if (u.name === v.name) continue;
            applyDiff(v, u);
        }
    }

    temp *= 1 - iterations / maxIterations;
    iterations++;
};

const startForce = ns => {
    let maxCharge = Math.max(...Array.from(ns).map(n => n.charge));
    // normalize charges over radius to only affect nodes in same hemisphere
    ns.forEach(n => n.charge = radius * (n.charge / maxCharge));
    nodes = ns;
    iterable = true;
};

module.exports = { startForce, iterateForce, iterating };
