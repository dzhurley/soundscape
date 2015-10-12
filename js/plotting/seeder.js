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
        let maxX = Math.max(Constants.globe.radius, this.position.x);
        let minX = Math.min(-Constants.globe.radius, this.position.x);

        let maxY = Math.max(Constants.globe.radius, this.position.y);
        let minY = Math.min(-Constants.globe.radius, this.position.y);

        let lat = this.position.x < 0 ?
            -90 / minX * this.position.x :
            90 / maxX * this.position.x;
        let lng = this.position.y < 0 ?
            -180 / minY * this.position.y :
            180 / maxY * this.position.y;

        this.setPosition(
            (180 - lng) * Math.PI / 180,
            (90 - lat) * Math.PI / 180
        );
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
