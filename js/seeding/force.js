'use strict';

/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

const radius = require('../constants').globe.radius;

// TODO: constants
const EPSILON = 0.000001;
const maxIterations = 100000;
let temp = 10000;

// use charge and distance
let repulse = (c, d) => c / d;
let bind = v => v.setLength(radius);


module.exports = nodes => {
    let iterations = 0;

    return () => {
        if (iterations < maxIterations && temp > EPSILON) {
            for (let v of nodes) {
                for (let u of nodes) {
                    if (u.name === v.name) continue;

                    // diff is the difference vector between the positions of the two vertices
                    let diff = v.position.clone().sub(u.position);
                    if (diff.length() > 3) {
                        let multiplier = repulse(v.charge, diff.length());
                        let divided = diff.divideScalar(diff.length());
                        v.position.add(divided.multiplyScalar(multiplier));
                        bind(v.position);
                    }
                }
            }

            temp *= 1 - iterations / maxIterations;
            iterations++;
            return false;
        }
        console.log('forces stable');
        return true;
    };
};
