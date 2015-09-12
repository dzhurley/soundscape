let THREE = require('three');
let scene = require('../three/scene');

let Layout = require('./force-directed-layout');
let graphModule = require('./Graph');

let Graph = graphModule.Graph;
let Node = graphModule.Node;
let Edge = graphModule.Edge;

var Drawing = Drawing || {};

Drawing.SphereGraph = function(options = {}) {
    this.nodes_count = 50;
    this.edges_count = 10;

    var camera;
    var geometry = new THREE.SphereGeometry( 5, 5, 0 );
    var graph = new Graph();

    window.seedGeometries = [];

    var sphere_radius = 5;
    var max_X = sphere_radius;
    var min_X = -sphere_radius;
    var max_Y = sphere_radius;
    var min_Y = -sphere_radius;

    var that = this;

    createGraph();

    function positionUpdated(node) {
        if (node._id === 0) {
            node.data.draw_object.position.x = 0;
            node.data.draw_object.position.y = 0;
            node.data.draw_object.position.z = 0;
            return;
        }
        max_X = Math.max(max_X, node.position.x);
        min_X = Math.min(min_X, node.position.x);
        max_Y = Math.max(max_Y, node.position.y);
        min_Y = Math.min(min_Y, node.position.y);

        console.log(`(${min_X} -> ${max_X}, ${min_Y} -> ${max_Y})`);

        var lat, lng;
        if(node.position.x < 0) {
            lat = (-90/min_X) * node.position.x;
        } else {
            lat = (90/max_X) * node.position.x;
        }
        if(node.position.y < 0) {
            lng = (-180/min_Y) * node.position.y;
        } else {
            lng = (180/max_Y) * node.position.y;
        }

        var area = 55;
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (180 - lng) * Math.PI / 180;
        node.data.draw_object.position.x = area * Math.sin(phi) * Math.cos(theta);
        node.data.draw_object.position.y = area * Math.cos(phi);
        node.data.draw_object.position.z = area * Math.sin(phi) * Math.sin(theta);
    }

    /**
     *  Creates a graph with random nodes and edges.
     *  Number of nodes and edges can be set with
     *  numNodes and numEdges.
     */
    function createGraph() {
        var startNode = new Node(0);
        graph.addNode(startNode);
        drawNode(startNode);

        var steps = 1;
        while(steps < that.nodes_count) {
            var numEdges = randomFromTo(1, that.edges_count);
            for(var i=1; i <= numEdges; i++) {
                var target_node = new Node(i*steps);
                if(graph.addNode(target_node)) {
                    drawNode(target_node);
                    if(graph.addEdge(startNode, target_node)) {
                        drawEdge(startNode, target_node);
                    }
                }
            }
            steps++;
        }

        // Transform a lat, lng-position to x,y.
        graph.layout = new Layout.ForceDirected(graph, { positionUpdated });
        graph.layout.init();
    }


    /**
     *  Create a node object and add it to the scene.
     */
    function drawNode(node) {
        var draw_object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {  color: Math.random() * 0xffffff } ) );

        var area = 10000;
        draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        node.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        node.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        draw_object._id = node._id;
        node.data.draw_object = draw_object;
        node.layout = {}
        node.layout.max_X = 90;
        node.layout.min_X = -90;
        node.layout.max_Y = 180;
        node.layout.min_Y = -180;

        // node.position = draw_object.position;
        scene.add( node.data.draw_object );
    }


    /**
     *  Create an edge object (line) and add it to the scene.
     */
    function drawEdge(source, target) {
        var material = new THREE.LineBasicMaterial({
            color: 0xCCCCCC, opacity: 0.5, linewidth: 0.5
        });
        var tmp_geo = new THREE.Geometry();

        tmp_geo.vertices.push(source.data.draw_object.position);
        tmp_geo.vertices.push(target.data.draw_object.position);

        var line = new THREE.Line( tmp_geo, material, THREE.LinePieces );
        line.scale.x = line.scale.y = line.scale.z = 1;
        line.originalScale = 1;

        window.seedGeometries.push(tmp_geo);

        scene.add( line );
    }


    // Generate random number
    function randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    // Stop layout calculation
    this.stop_calculating = function() {
        graph.layout.stop_calculating();
    };

    return graph;
};

module.exports = Drawing;
