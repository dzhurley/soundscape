'use strict';

/* Displays artist and face information on click
 *
 * A constant display for artist info is updated on click
 * with the closest artist. All faces and vertices in a
 * given artist's region are also annotated with their
 * indices for debugging purposes.
 */

const THREE = require('three');
const { labels } = require('./constants');
const { camera } = require('./three/main');
const globe = require('./three/globe');
const scene = require('./three/scene');

const ArtistManager = require('./artists');

// if the value is a string, return it, otherwise return the number as an integer
const getMarkProp = key => isNaN(labels[key]) ? labels[key] : +labels[key];

function render({ artist=null, plays=null, a, b, c }) {
    let template = `<span>face.a = ${a}</span>
                    <span>face.b = ${b}</span>
                    <span>face.c = ${c}</span>`;
    if (artist && plays) {
        template = `<span>${artist}, played ${plays} time(s)</span>` + template;
    }
    return template;
}

function setVerticesFromArtistEdges(artist) {
    let edges = ArtistManager.edgesForArtist(artist);
    addVertexMarkers(globe.uniqueVerticesForEdges(edges));
}

function addVertexMarkers(vertices) {
    let mark, vertex;
    vertices.map(index => {
        mark = makeMark(JSON.stringify(index));
        vertex = globe.geometry.vertices[index];
        mark.position.copy(vertex.clone().multiplyScalar(1.005));
        scene.add(mark);
    });
}

function addFaceMarkers(face) {
    let mark = makeMark(globe.geometry.faces.indexOf(face));
    mark.position.copy(globe.faceCentroid(face).multiplyScalar(1.005));
    scene.add(mark);
}

// TODO: favor dom over canvas for tooltips
// TODO: constants
function makeMark(message) {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1600;
    let context = canvas.getContext('2d');

    let fontface = getMarkProp('fontface');
    let fontsize = getMarkProp('fontsize');

    context.font = `${fontsize}px ${fontface}`;

    let textWidth = context.measureText(message).width;
    if (textWidth > canvas.width) {
        canvas.width = canvas.height = textWidth;
        context = canvas.getContext('2d');
        context.font = `${fontsize}px ${fontface}`;
    }

    context.fillStyle = getMarkProp('backgroundColor');
    context.fillRect(canvas.width * 0.25,
                     canvas.height / 2 - fontsize,
                     canvas.width * 0.5,
                     canvas.height / 3);

    context.fillStyle = getMarkProp('color');
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    let map = new THREE.Texture(canvas);
    map.needsUpdate = true;
    return new THREE.Sprite(new THREE.SpriteMaterial({ map, name: 'marker' }));
}

function getIntersects(x, y) {
    let vector = new THREE.Vector3(x, y, 1).unproject(camera);
    let ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    return ray.intersectObject(globe);
}

function removeMarkers() {
    scene.children
        .filter(c => c.material && c.material.name === 'marker')
        .map(c => scene.remove(c));
}

function update(evt) {
    let intersects = getIntersects(evt.clientX / window.innerWidth * 2 - 1,
                                   -(evt.clientY / window.innerHeight) * 2 + 1);

    if (!intersects.length) return false;

    let face = intersects[0].face;
    let isPainted = face.data && face.data.artist;

    removeMarkers();

    if (isPainted) {
        setVerticesFromArtistEdges(face.data.artist);
        globe.geometry.faces
            .filter(f => f.data.artist === face.data.artist)
            .map(f => addFaceMarkers(f));
    } else {
        addVertexMarkers([face.a, face.b, face.c]);
        addFaceMarkers(face);
    }

    let data = Object.assign({}, face.data, { a: face.a, b: face.b, c: face.c });
    document.getElementById('hud').innerHTML = render(data);
}

module.exports = {
    bindHandlers(element) {
        element.addEventListener('click', update);
    }
};
