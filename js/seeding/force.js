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

class ForceDirected {
    constructor(nodes) {
        this.nodes = nodes;
        // each vertex has two vectors: .position and .display
        this.nodes.forEach(node => node.display = node.position.clone());
        this.iterations = 0;
    }

    calculateRepulsion() {
        for (let v of this.nodes) {
            for (let u of this.nodes) {
                if (u.name === v.name) continue;

                // diff is the difference vector between the positions of the two vertices
                let diff = v.position.clone().sub(u.position);
                v.display.add(diff.divideScalar(diff.length()).multiplyScalar(v.charge));
            }
        }
    }

    calculatePositions() {
        for (let v of this.nodes) {
            v.position.add(v.display.divideScalar(v.display.length()));
        }
    }

    bind() {
        for (let node of this.nodes) {
            let { x, y, z } = node.position;
            // -50 >= z >= 50 for valid acos() domain
            let boundedZ = z > 50 ? 50 : z < -50 ? -50 : z;
            node.setPosition(Math.acos(boundedZ / radius), Math.atan2(y, x));
        }
    }

    generate() {
        if (this.iterations < maxIterations && temp > EPSILON) {
            this.calculateRepulsion();
            this.calculatePositions();
            temp *= 1 - this.iterations / maxIterations;
            this.iterations++;
            return true;
        }
        return false;
    }
}

module.exports = ForceDirected;
