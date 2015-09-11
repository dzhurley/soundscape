'use strict';

let THREE = require('three');

let h = require('../helpers');
let ArtistManager = require('../artists');
let scene = require('../three/scene');
let globe = require('../three/globe');

function addEquidistantMarks(num) {
    let markers = [];
    let mark;
    let points = h.equidistantishPointsOnSphere(num);

    for (let i in points) {
        mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
        mark.position.x = points[i][0];
        mark.position.y = points[i][1];
        mark.position.z = points[i][2];
        mark.position.multiplyScalar(globe.geometry.parameters.radius + 2);
        markers.push(mark);
        scene.add(mark);
    }

    return markers;
}

function equidistantFaces(numMarkers) {
    // add transient helper marks
    let markers = addEquidistantMarks(numMarkers);

    let caster = new THREE.Raycaster();
    let intersectingFaces = [];
    let marker;
    for (let i = 0; i < markers.length; i++) {
        // use the mark's vector as a ray to find the closest face
        // via its intersection
        marker = markers[i].position.clone();
        caster.set(globe.position, marker.normalize());
        intersectingFaces.push(caster.intersectObject(globe));
    }

    // clean up transient markers
    markers.map(mark => scene.remove(mark));

    // return at most one face for each intersection
    return intersectingFaces.map(hit => hit[0]);
}

function prepareData(data) {
    ArtistManager.setArtists({
        artists: data,
        totalFaces: globe.geometry.faces.length
    });

    globe.geometry.faces.map(face => face.data = {});
}

function seedIndices() {
    return equidistantFaces(ArtistManager.artistsLeft()).map(seed => seed.faceIndex);
}

module.exports = { prepareData, seedIndices };
