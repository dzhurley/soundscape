'use strict';

let THREE = require('three');
let scene = require('../three/scene');

let ForceDirected = require('./force');
let graphModule = require('./graph');

let Graph = graphModule.Graph;
let Node = graphModule.Node;

var SphereGraph = function() {
    var radius = 5;
    var maxX = radius;
    var minX = -radius;
    var maxY = radius;
    var minY = -radius;

    var geometry = new THREE.SphereGeometry( 5, 5, 0 );
    var graph = new Graph();

    var numNodes = 50;

    window.seedGeometries = [];

    function positionUpdated(node) {
        if (node.nid === 0) {
            node.data.drawObject.position.x = 0;
            node.data.drawObject.position.y = 0;
            node.data.drawObject.position.z = 0;
            return;
        }
        maxX = Math.max(maxX, node.position.x);
        minX = Math.min(minX, node.position.x);
        maxY = Math.max(maxY, node.position.y);
        minY = Math.min(minY, node.position.y);

        let lat, lng;
        if (node.position.x < 0) {
            lat = -90 / minX * node.position.x;
        } else {
            lat = 90 / maxX * node.position.x;
        }
        if (node.position.y < 0) {
            lng = -180 / minY * node.position.y;
        } else {
            lng = 180 / maxY * node.position.y;
        }

        let area = 55;
        let phi = (90 - lat) * Math.PI / 180;
        let theta = (180 - lng) * Math.PI / 180;
        node.data.drawObject.position.x = area * Math.sin(phi) * Math.cos(theta);
        node.data.drawObject.position.y = area * Math.cos(phi);
        node.data.drawObject.position.z = area * Math.sin(phi) * Math.sin(theta);
    }

    function drawNode(node) {
        var drawObject = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
        );

        var area = 10000;
        drawObject.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        node.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        node.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        drawObject.nid = node.nid;
        node.data.drawObject = drawObject;
        node.layout = {};
        node.layout.maxX = 90;
        node.layout.minX = -90;
        node.layout.maxY = 180;
        node.layout.minY = -180;

        // node.position = drawObject.position;
        scene.add( node.data.drawObject );
    }

    function createGraph() {
        var steps = 1;
        var startNode = new Node(0);
        graph.addNode(startNode);
        drawNode(startNode);

        while (steps < numNodes) {
            let edges = randomFromTo(1, 10);
            for (let i = 1; i <= edges; i++) {
                let targetNode = new Node(i * steps);
                if (graph.addNode(targetNode)) {
                    drawNode(targetNode);
                    if (graph.addEdge(startNode, targetNode)) {
                        drawEdge(startNode, targetNode);
                    }
                }
            }
            steps++;
        }

        return new ForceDirected(graph, { positionUpdated });
    }

    function drawEdge(source, target) {
        var material = new THREE.LineBasicMaterial({
            color: 0xCCCCCC, opacity: 1, linewidth: 0.5
        });
        var tmpGeo = new THREE.Geometry();

        tmpGeo.vertices.push(source.data.drawObject.position);
        tmpGeo.vertices.push(target.data.drawObject.position);

        let line = new THREE.Line(tmpGeo, material, THREE.LinePieces);
        line.scale.x = line.scale.y = line.scale.z = 1;
        line.originalScale = 1;

        window.seedGeometries.push(tmpGeo);

        scene.add(line);
    }

    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    return createGraph();
};

module.exports = SphereGraph;
