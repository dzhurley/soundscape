'use strict';

/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

// TODO: constants
const EPSILON = 0.000001;
const width = 200;
const height = 200;
const maxIterations = 100000;

const repulsionMultiplier = 0.75;

class ForceDirected {
    constructor(nodes) {
        this.nodes = nodes;
        this.nodes.forEach(node => {
            node.layout = {
                offsetX: 0, offsetY: 0, offsetZ: 0,
                tmpPosX: node.position.x, tmpPosY: node.position.y, tmpPosZ: node.position.z,
                force: 0
            };
        });

        this.temp = width / 10.0;
        this.iterations = 0;
        this.repulsionConstant = repulsionMultiplier * Math.sqrt(width * height / this.nodes.size);
    }

    calculateRepulsion() {
        for (let nodeV of this.nodes) {
            for (let nodeU of this.nodes) {
                if (nodeU.name === nodeV.name) continue;

                let deltaX = nodeV.layout.tmpPosX - nodeU.layout.tmpPosX;
                let deltaY = nodeV.layout.tmpPosY - nodeU.layout.tmpPosY;
                let deltaZ = nodeV.layout.tmpPosZ - nodeU.layout.tmpPosZ;

                let deltaLength = Math.max(
                    EPSILON, Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                );
                let deltaLengthZ = Math.max(
                    EPSILON, Math.sqrt(deltaZ * deltaZ + deltaY * deltaY)
                );

                let force = this.repulsionConstant * this.repulsionConstant / deltaLength;
                let forceZ = this.repulsionConstant * this.repulsionConstant / deltaLengthZ;

                nodeV.layout.force += force;
                nodeU.layout.force += force;

                nodeV.layout.offsetX += deltaX / deltaLength * force;
                nodeV.layout.offsetY += deltaY / deltaLength * force;

                nodeU.layout.offsetX -= deltaX / deltaLength * force;
                nodeU.layout.offsetY -= deltaY / deltaLength * force;

                nodeV.layout.offsetZ += deltaZ / deltaLengthZ * forceZ;
                nodeU.layout.offsetZ -= deltaZ / deltaLengthZ * forceZ;
            }
        }
    }

    calculatePositions() {
        for (let node of this.nodes) {
            let deltaLength = Math.max(
                EPSILON, Math.sqrt(node.layout.offsetX * node.layout.offsetX +
                                   node.layout.offsetY * node.layout.offsetY));
            let deltaLengthZ = Math.max(
                EPSILON, Math.sqrt(node.layout.offsetZ * node.layout.offsetZ +
                                   node.layout.offsetY * node.layout.offsetY));

            node.layout.tmpPosX += node.layout.offsetX / deltaLength * Math.min(deltaLength,
                                                                                this.temp);
            node.layout.tmpPosY += node.layout.offsetY / deltaLength * Math.min(deltaLength,
                                                                                this.temp);
            node.layout.tmpPosZ += node.layout.offsetZ / deltaLengthZ * Math.min(deltaLengthZ,
                                                                                 this.temp);

            node.position.x -= node.position.x - node.layout.tmpPosX / 10;
            node.position.y -= node.position.y - node.layout.tmpPosY / 10;
            node.position.z -= node.position.z - node.layout.tmpPosZ / 10;

            node.updatePosition();
        }
    }

    generate() {
        if (this.iterations < maxIterations && this.temp > EPSILON) {
            this.calculateRepulsion();
            this.calculatePositions();
            this.temp *= 1 - this.iterations / maxIterations;
            this.iterations++;
            return true;
        }
        return false;
    }
}

module.exports = ForceDirected;
