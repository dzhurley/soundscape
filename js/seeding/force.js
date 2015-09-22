'use strict';

/**
  Adapted from davidpiegza's work at http://github.com/davidpiegza/Graph-Visualization

  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

var ForceDirected = function(graph) {
    var EPSILON = 0.000001;
    var width = 200;
    var height = 200;

    var radius = 5;
    var maxX = radius;
    var minX = -radius;
    var maxY = radius;
    var minY = -radius;

    var temperature = width / 10.0;
    var forceConstant = Math.sqrt(width * height / graph.nodes.size);

    var repulsionConstant = 0.75 * forceConstant;
    var iterations = 0;

    this.maxIterations = 100000;
    this.graph = graph;
    this.finished = false;

    this.onPositionUpdate = function(node) {
        if (!node.charge) {
            node.position.x = 0;
            node.position.y = 0;
            node.position.z = 0;
            return;
        }
        maxX = Math.max(maxX, node.position.x);
        minX = Math.min(minX, node.position.x);
        maxY = Math.max(maxY, node.position.y);
        minY = Math.min(minY, node.position.y);

        let lat = node.position.x < 0 ?
            -90 / minX * node.position.x :
            90 / maxX * node.position.x;
        let lng = node.position.y < 0 ?
            -180 / minY * node.position.y :
            180 / maxY * node.position.y;

        let area = 55;
        let phi = (90 - lat) * Math.PI / 180;
        let theta = (180 - lng) * Math.PI / 180;
        node.position.x = area * Math.sin(phi) * Math.cos(theta);
        node.position.y = area * Math.cos(phi);
        node.position.z = area * Math.sin(phi) * Math.sin(theta);
    };

    this.calculateRepulsion = function() {
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
    };

    this.calculatePositions = function() {
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

            this.onPositionUpdate(node);
        }
    };

    this.generate = function() {
        if (iterations < this.maxIterations && temperature > EPSILON) {
            this.calculateRepulsion();
            this.calculatePositions();
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
