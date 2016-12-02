// Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization,
// based on Fruchterman and Reingold and the JUNG implementation.

const { emitOnMain } = require('dispatch');
const constants = require('constants');
const scene = require('three/scene');

const { paint } = require('seeding/paint');

const {
    force: { epsilon, globeDivisor, initialTemp, maxIterations },
    globe,
    node
} = constants;

let iterations;
let nodes;
let temp;

// checked in render cycle to start/stop calling iterateForce
let iterable = false;
const iterating = () => iterable;

const finish = () => {
    iterable = false;

    // extract node information to hand off for painting and display
    const positions = Array.from(nodes).map(node => {
        scene.remove(node);
        node.position.color = node.material.color;
        node.position.data = { artist: node.name };
        return node.position;
    });

    emitOnMain('seeded', positions);
    paint(positions);
};

const applyDiff = (v, u) => {
    // diff is the difference vector between the positions of the two vertices
    const diff = u.position.clone().sub(v.position);
    const length = diff.length();

    // repel one node (u) based on combination of two interacting nodes
    if (length <= v.charge) {
        const multiplier = length / (v.charge * u.charge);
        u.position.add(diff.multiplyScalar(multiplier));
    }
    // bind to surface of globe
    u.position.setLength(globe.radius + node.radius);
};

const iterateForce = () => {
    // cap the number of times this can run if we don't cool fast enough
    if (iterations >= maxIterations || temp <= epsilon) return finish();

    // match each node against all others
    for (let v of nodes) {
        for (let u of nodes) {
            if (u.name === v.name) continue;
            applyDiff(v, u);
        }
    }

    // cool each iteration to approach epsilon
    temp *= 1 - iterations / maxIterations;
    iterations++;
};

const startForce = ns => {
    const maxCharge = Math.max(...Array.from(ns).map(n => n.charge));
    // narrow the range of charges underneath the radius of the globe
    ns.forEach(n => n.charge = (globe.radius / globeDivisor) * (n.charge / maxCharge));

    iterable = true;
    iterations = 0;
    nodes = ns;
    temp = initialTemp;

    while (iterating()) iterateForce();
};

module.exports = { startForce, iterateForce, iterating };
