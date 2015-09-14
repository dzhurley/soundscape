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
    var forceConstant = Math.sqrt(width * height / graph.nodes.size);

    var repulsionConstant = 0.75 * forceConstant;
    var iterations = 0;

    this.maxIterations = 100000;
    this.graph = graph;
    this.finished = false;

    this.generate = function() {
        if (iterations < this.maxIterations && temperature > EPSILON) {
            // calculate repulsion
            for (let nodeV of graph.nodes) {
                for (let nodeU of graph.nodes) {
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

                    let force = repulsionConstant * repulsionConstant / deltaLength;
                    let forceZ = repulsionConstant * repulsionConstant / deltaLengthZ;

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

            // calculate positions
            for (let node of graph.nodes) {
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

                node.position.x -= node.position.x - node.layout.tmpPosX / 10;
                node.position.y -= node.position.y - node.layout.tmpPosY / 10;
                node.position.z -= node.position.z - node.layout.tmpPosZ / 10;

                positionCallback && positionCallback(node);
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
