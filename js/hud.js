'use strict';

/* Displays artist and face information on click
 *
 * A constant display for artist info is updated on click
 * with the closest artist. All faces and vertices in a
 * given artist's region are also annotated with their
 * indices for debugging purposes.
 */

const { Raycaster, Sprite, SpriteMaterial, Texture, Vector3 } = require('three');

const { labels } = require('./constants');
const { getCamera } = require('./three/camera');
const { faceCentroid } = require('./helpers');
const { faces, globe, uniqueVerticesForEdges, vertices } = require('./three/globe');
const scene = require('./three/scene');
const { edgesForArtist } = require('./artists');

// if the value is a string, return it, otherwise return the number as an integer
const getMarkProp = key => isNaN(labels[key]) ? labels[key] : +labels[key];

const render = ({ artist=null, plays=null, a, b, c }) => {
    let template = `<span>face.a = ${a}</span>
                    <span>face.b = ${b}</span>
                    <span>face.c = ${c}</span>`;
    if (artist && plays) {
        template = `<span>${artist}, played ${plays} time(s)</span>` + template;
    }
    return template;
};

const addVertexMarkers = vs => vs.map(index => {
    let mark = makeMark(JSON.stringify(index));
    mark.position.copy(vertices()[index].clone().multiplyScalar(1.005));
    scene.add(mark);
});

const addFaceMarkers = face => {
    let mark = makeMark(faces().indexOf(face));
    mark.position.copy(faceCentroid(globe, face).multiplyScalar(1.005));
    scene.add(mark);
};

// TODO: favor dom over canvas for tooltips
const makeMark = message => {
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

    let map = new Texture(canvas);
    map.needsUpdate = true;
    return new Sprite(new SpriteMaterial({ map, name: 'marker' }));
};

const getIntersects = (x, y) => {
    let cam = getCamera();
    let vector = new Vector3(x, y, 1).unproject(cam);
    let ray = new Raycaster(cam.position, vector.sub(cam.position).normalize());
    return ray.intersectObject(globe);
};

const removeMarkers = () => scene.children
                                .filter(c => c.material && c.material.name === 'marker')
                                .map(c => scene.remove(c));

const update = evt => {
    let intersects = getIntersects(evt.clientX / window.innerWidth * 2 - 1,
                                   -(evt.clientY / window.innerHeight) * 2 + 1);

    if (!intersects.length) return false;

    let face = intersects[0].face;
    let isPainted = face.data && face.data.artist;

    removeMarkers();

    if (isPainted) {
        addVertexMarkers(uniqueVerticesForEdges(edgesForArtist(face.data.artist)));
        faces().filter(f => f.data.artist === face.data.artist).map(addFaceMarkers);
    } else {
        addVertexMarkers([face.a, face.b, face.c]);
        addFaceMarkers(face);
    }

    let data = Object.assign({}, face.data, { a: face.a, b: face.b, c: face.c });
    document.getElementById('hud').innerHTML = render(data);
};

const bindHandlers = element => element.addEventListener('click', update);

module.exports = { bindHandlers };
