'use strict';

const radius = require('../constants').globe.radius;
const THREE = require('three');
const ArtistManager = require('../artists');
const h = require('../helpers');
const globe = require('../three/globe');
const scene = require('../three/scene');

const ForceDirected = require('../seeding/force');

class Node extends THREE.Mesh {
    constructor({ name, faces: charge, color: color=0xffffff } = {}) {
        super(
            // TODO: constants
            new THREE.SphereGeometry(2.5, 25, 25),
            new THREE.MeshBasicMaterial({ color })
        );

        this.name = name;
        this.charge = charge;
    }

    setPosition(theta, phi) {
        this.position.x = radius * Math.sin(theta) * Math.cos(phi);
        this.position.y = radius * Math.cos(theta);
        this.position.z = radius * Math.sin(theta) * Math.sin(phi);
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
        targetNode.position.x = points[i][0];
        targetNode.position.y = points[i][1];
        targetNode.position.z = points[i][2];
        targetNode.position.multiplyScalar(radius);

        nodeSet.add(targetNode);
        scene.add(targetNode);
    }

    return new ForceDirected(nodeSet);
}

function seed(payload) {
    prepareData(JSON.parse(payload));
    window.seedGraph = createGraph(ArtistManager.artists);
}

module.exports = { prepareData, seed };
