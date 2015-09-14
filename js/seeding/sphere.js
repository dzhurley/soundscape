'use strict';

let scene = require('../three/scene');

let ForceDirected = require('./force');
let {Graph, Node} = require('./graph');

var SphereGraph = function(data) {
    var radius = 5;
    var maxX = radius;
    var minX = -radius;
    var maxY = radius;
    var minY = -radius;

    var graph = new Graph();

    window.seedGeometries = [];

    function positionUpdated(node) {
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
    }

    function createGraph() {
        var startNode = new Node();
        graph.addNode(startNode);
        scene.add(startNode);

        for (let artist of data) {
            let targetNode = new Node(artist);
            if (graph.addNode(targetNode)) {
                scene.add(targetNode);
                let edge = graph.addEdge(startNode, targetNode);
                if (edge) {
                    window.seedGeometries.push(edge.geometry);
                    scene.add(edge);
                }
            }
        }

        return new ForceDirected(graph, { positionUpdated });
    }

    return createGraph();
};

module.exports = SphereGraph;
