'use strict';

const radius = require('../constants').globe.radius;
const THREE = require('three');
const ArtistManager = require('../artists');
const h = require('../helpers');
const globe = require('../three/globe');
const scene = require('../three/scene');

const forceSeed = require('../seeding/force');

class Node extends THREE.Mesh {
    constructor({ name, faces: charge, color: color=0xffffff } = {}) {
        super(
            // TODO: constants
            new THREE.SphereGeometry(1.5, 25, 25),
            new THREE.MeshBasicMaterial({ color })
        );

        this.name = name;
        this.charge = charge;
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
    let points = h.equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = new Node(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodeSet.add(targetNode);
        scene.add(targetNode);
    }

    return forceSeed(nodeSet);
}

function seed(payload) {
    prepareData(JSON.parse(payload));
    window.forceSeed = createGraph(ArtistManager.artists);
}

module.exports = { prepareData, seed };
