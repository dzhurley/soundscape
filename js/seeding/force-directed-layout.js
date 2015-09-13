'use strict';

/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

var ForceDirected = function(graph, options = {}) {
    var positionCallback = options.positionUpdated;

    var EPSILON = 0.000001;
    var width = 200;
    var height = 200;

    var temperature = width / 10.0;
    var numNodes = graph.nodes.length;
    var forceConstant = Math.sqrt(width * height / numNodes);

    var repulsionConstant = 0.75 * forceConstant;
    var iterations = 0;

    this.maxIterations = 1000;
    this.graph = graph;
    this.finished = false;

    this.generate = function() {
        if (iterations < this.maxIterations && temperature > 0.000001) {
            // calculate repulsion
            for (let i = 0; i < numNodes; i++) {
                let nodeV = graph.nodes[i];
                nodeV.layout = nodeV.layout || {};
                if (i === 0) {
                    nodeV.layout.offsetX = 0;
                    nodeV.layout.offsetY = 0;
                    nodeV.layout.offsetZ = 0;
                }

                nodeV.layout.force = 0;
                nodeV.layout.tmpPosX = nodeV.layout.tmpPosX || nodeV.position.x;
                nodeV.layout.tmpPosY = nodeV.layout.tmpPosY || nodeV.position.y;
                nodeV.layout.tmpPosZ = nodeV.layout.tmpPosZ || nodeV.position.z;

                for (let j = i + 1; j < numNodes; j++) {
                    let nodeU = graph.nodes[j];
                    if (i !== j) {
                        nodeU.layout = nodeU.layout || {};
                        nodeU.layout.tmpPosX = nodeU.layout.tmpPosX || nodeU.position.x;
                        nodeU.layout.tmpPosY = nodeU.layout.tmpPosY || nodeU.position.y;
                        nodeU.layout.tmpPosZ = nodeU.layout.tmpPosZ || nodeU.position.z;

                        let deltaX = nodeV.layout.tmpPosX - nodeU.layout.tmpPosX;
                        let deltaY = nodeV.layout.tmpPosY - nodeU.layout.tmpPosY;
                        let deltaZ = nodeV.layout.tmpPosZ - nodeU.layout.tmpPosZ;

                        let deltaLength = Math.max(
                            EPSILON, Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                        );
                        let deltaLengthZ = Math.max(
                            EPSILON, Math.sqrt(deltaZ * deltaZ + deltaY * deltaY)
                        );

                        let force = repulsionConstant * repulsionConstant / deltaLength;
                        let forceZ = repulsionConstant * repulsionConstant / deltaLengthZ;

                        nodeV.layout.force += force;
                        nodeU.layout.force += force;

                        nodeV.layout.offsetX += deltaX / deltaLength * force;
                        nodeV.layout.offsetY += deltaY / deltaLength * force;

                        if (i === 0) {
                            nodeU.layout.offsetX = 0;
                            nodeU.layout.offsetY = 0;
                            nodeU.layout.offsetZ = 0;
                        }
                        nodeU.layout.offsetX -= deltaX / deltaLength * force;
                        nodeU.layout.offsetY -= deltaY / deltaLength * force;

                        nodeV.layout.offsetZ += deltaZ / deltaLengthZ * forceZ;
                        nodeU.layout.offsetZ -= deltaZ / deltaLengthZ * forceZ;
                    }
                }
            }

            // calculate positions
            for (let i = 0; i < numNodes; i++) {
                let node = graph.nodes[i];

                let deltaLength = Math.max(
                    EPSILON, Math.sqrt(node.layout.offsetX * node.layout.offsetX +
                                       node.layout.offsetY * node.layout.offsetY));
                let deltaLengthZ = Math.max(
                    EPSILON, Math.sqrt(node.layout.offsetZ * node.layout.offsetZ +
                                       node.layout.offsetY * node.layout.offsetY));

                node.layout.tmpPosX += node.layout.offsetX / deltaLength * Math.min(deltaLength,
                                                                                    temperature);
                node.layout.tmpPosY += node.layout.offsetY / deltaLength * Math.min(deltaLength,
                                                                                    temperature);
                node.layout.tmpPosZ += node.layout.offsetZ / deltaLengthZ * Math.min(deltaLengthZ,
                                                                                     temperature);

                let updated = true;
                node.position.x -= node.position.x - node.layout.tmpPosX / 10;
                node.position.y -= node.position.y - node.layout.tmpPosY / 10;
                node.position.z -= node.position.z - node.layout.tmpPosZ / 10;

                // execute callback function if positions has been updated
                if (updated && typeof positionCallback === 'function') {
                    positionCallback(node);
                }
            }
            temperature *= 1 - iterations / this.maxIterations;
            iterations++;
        } else {
            this.finished = true;
            return false;
        }
        return true;
    };
};

module.exports = ForceDirected;
