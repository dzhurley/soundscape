'use strict';

const Constants = require('../constants');
const THREE = require('three');
const ArtistManager = require('../artists');
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

        // randomize theta and phi on initial plot
        this.setPosition(Math.random() * Math.PI, Math.random() * 2 * Math.PI);
    }

    setPosition(theta, phi) {
        this.position.x = Constants.globe.radius * Math.sin(theta) * Math.cos(phi);
        this.position.y = Constants.globe.radius * Math.cos(theta);
        this.position.z = Constants.globe.radius * Math.sin(theta) * Math.sin(phi);
    }

    updatePosition() {
        let { x, y, z } = this.position;
        // calculate new theta and phi
        let theta = Math.acos(z / Constants.globe.radius);
        let phi = Math.atan2(y, x);

        console.log(`theta: ${theta}`);
        console.log(`phi: ${phi}`);
        this.setPosition(theta, phi);
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
