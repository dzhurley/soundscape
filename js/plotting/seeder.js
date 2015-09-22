'use strict';

let ArtistManager = require('../artists');
let globe = require('../three/globe');
let scene = require('../three/scene');

let ForceDirected = require('../seeding/force');
let {Graph, Node} = require('../seeding/graph');

function prepareData(data) {
    ArtistManager.setArtists({
        artists: data,
        totalFaces: globe.geometry.faces.length
    });

    globe.geometry.faces.map(face => face.data = {});
}

function createGraph(data) {
    var graph = new Graph();

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

    return new ForceDirected(graph);
}

function seed(payload) {
    window.seedGeometries = [];

    prepareData(JSON.parse(payload));

    window.seedGraph = createGraph(ArtistManager.artists);
}

module.exports = { prepareData, seed };
