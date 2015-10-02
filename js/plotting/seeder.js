'use strict';

const THREE = require('three');
const ArtistManager = require('../artists');
const globe = require('../three/globe');
const scene = require('../three/scene');

const ForceDirected = require('../seeding/force');

class Node extends THREE.Mesh {
    constructor({ name, faces: charge, color: color=0xffffff } = {}) {
        super(
            // TODO: constants
            new THREE.SphereGeometry(2.5, 15, 15),
            new THREE.MeshBasicMaterial({ color })
        );

        this.name = name;
        this.charge = charge;

        // TODO: constants
        let randomStart = () => Math.random() * -100 + 50;

        this.position.x = randomStart();
        this.position.y = randomStart();
        this.position.z = randomStart();
    }
}

function prepareData(data) {
    ArtistManager.setArtists({
        artists: data,
        totalFaces: globe.geometry.faces.length
    });

    globe.geometry.faces.map(face => face.data = {});
}

function createGraph(data) {
    let nodeSet = new Set();

    for (let artist of data) {
        let targetNode = new Node(artist);
        if (!nodeSet.has(targetNode)) {
            nodeSet.add(targetNode);
            scene.add(targetNode);
        }
    }

    return new ForceDirected(nodeSet);
}

function seed(payload) {
    prepareData(JSON.parse(payload));
    window.seedGraph = createGraph(ArtistManager.artists);
}

module.exports = { prepareData, seed };
