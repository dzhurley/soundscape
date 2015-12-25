'use strict';

const radius = require('../constants').globe.radius;
const THREE = require('three');
const { artists, numArtistsLeft, setArtists } = require('../artists');
const { equidistantishPointsOnSphere } = require('../helpers');
const { faces, globe, position } = require('../three/globe');
const scene = require('../three/scene');

const force = require('../seeding/force');

function prepareData(data) {
    setArtists({
        artists: data,
        totalFaces: faces().length
    });

    faces().map(face => face.data = {});
}

// XXX:begin force-seeding
//
// no current worker-side implementation

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

function createGraph(data) {
    let nodeSet = new Set();
    let points = equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = new Node(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodeSet.add(targetNode);
        scene.add(targetNode);
    }

    return force(nodeSet);
}

function forceSeed(payload) {
    prepareData(JSON.parse(payload));
    window.forceSeed = createGraph(artists());
}

// XXX:end force-seeding

function addEquidistantMarks(num) {
    return equidistantishPointsOnSphere(num).map(p => {
        let mark = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff0000 }));
        mark.position.set(...p);
        mark.position.multiplyScalar(radius + 2);
        scene.add(mark);
        return mark;
    });
}

function equidistantFaces(numMarkers) {
    // add transient helper marks
    let markers = addEquidistantMarks(numMarkers);
    let caster = new THREE.Raycaster();
    let intersectingFaces = [];

    // use the mark's vector as a ray to find the closest face
    // via its intersection
    markers.map(m => {
        caster.set(position, m.position.normalize());
        intersectingFaces.push(caster.intersectObject(globe));
    });

    // clean up transient markers
    markers.map(mark => scene.remove(mark));

    // return at most one face for each intersection
    return intersectingFaces.map(hit => hit[0]);
}

function seedIndices() {
    return equidistantFaces(numArtistsLeft()).map(seed => seed.faceIndex);
}

module.exports = { prepareData, seedIndices, forceSeed };
