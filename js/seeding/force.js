// Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization,
// based on Fruchterman and Reingold and the JUNG implementation.

const { emit, emitOnMain } = require('dispatch');
const constants = require('constants');
const scene = require('three/scene');

const {
    force: { epsilon, globeDivisor, initialTemp, maxIterations },
    globe,
    node
} = constants;

let temp = initialTemp;
let iterations = 0;
let nodes = new Set();

// checked in render cycle to start/stop calling iterateForce
let iterable = false;
const iterating = () => iterable;

const finish = () => {
    iterable = false;

    const positions = Array.from(nodes).map(node => {
        scene.remove(node);
        node.position.color = node.material.color;
        node.position.data = { artist: node.name };
        return node.position;
    });

    emitOnMain('seeded', positions);
    emit('seeded', positions);
};

const applyDiff = (v, u) => {
    // diff is the difference vector between the positions of the two vertices
    const diff = u.position.clone().sub(v.position);
    const length = diff.length();

    if (length <= v.charge) {
        const multiplier = length / (v.charge * u.charge);
        u.position.add(diff.multiplyScalar(multiplier));
    }
    // bind to surface of globe
    u.position.setLength(globe.radius + node.radius);
};

const iterateForce = () => {
    if (iterations >= maxIterations || temp <= epsilon) return finish();

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
    const maxCharge = Math.max(...Array.from(ns).map(n => n.charge));
    // narrow the range of charges underneath the radius of the globe
    ns.forEach(n => n.charge = (globe.radius / globeDivisor) * (n.charge / maxCharge));
    nodes = ns;
    iterable = true;

    while (iterating()) iterateForce();
};

module.exports = { startForce, iterateForce, iterating };
