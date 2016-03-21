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
const { faceCentroid, withId } = require('./helpers');
const { getCamera } = require('./three/camera');
const { faces, globe, vertices } = require('./three/globe');
const scene = require('./three/scene');

// if the value is a string, return it, otherwise return the number as an integer
const labelProp = key => isNaN(labels[key]) ? labels[key] : +labels[key];

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
    const mark = makeMark(JSON.stringify(index));
    mark.position.copy(vertices()[index].clone().multiplyScalar(labelProp('radius')));
    scene.add(mark);
});

const addFaceMarkers = face => {
    const mark = makeMark(faces().indexOf(face));
    mark.position.copy(faceCentroid(globe, face).multiplyScalar(labelProp('radius')));
    scene.add(mark);
};

// TODO: favor dom over canvas for tooltips
const makeMark = message => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = labelProp('canvasHeightWidth');
    let context = canvas.getContext('2d');

    const fontface = labelProp('fontface');
    const fontsize = labelProp('fontsize');

    context.font = `${fontsize}px ${fontface}`;

    const textWidth = context.measureText(message).width;
    if (textWidth > canvas.width) {
        canvas.width = canvas.height = textWidth;
        context = canvas.getContext('2d');
        context.font = `${fontsize}px ${fontface}`;
    }

    context.fillStyle = labelProp('backgroundColor');
    context.fillRect(canvas.width * 0.25,
                     canvas.height / 2 - fontsize,
                     canvas.width * 0.5,
                     canvas.height / 3);

    context.fillStyle = labelProp('color');
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const map = new Texture(canvas);
    map.needsUpdate = true;
    return new Sprite(new SpriteMaterial({ map, name: 'marker' }));
};

const getIntersects = (x, y) => {
    const cam = getCamera();
    const vector = new Vector3(x, y, 1).unproject(cam);
    const ray = new Raycaster(cam.position, vector.sub(cam.position).normalize());
    return ray.intersectObject(globe);
};

const removeMarkers = () => scene.children
                                .filter(c => c.material && c.material.name === 'marker')
                                .map(c => scene.remove(c));

const update = evt => {
    const intersects = getIntersects(evt.clientX / window.innerWidth * 2 - 1,
                                     -(evt.clientY / window.innerHeight) * 2 + 1);

    if (!intersects.length) return false;

    const face = intersects[0].face;

    removeMarkers();
    addVertexMarkers([face.a, face.b, face.c]);
    addFaceMarkers(face);

    const { a, b, c } = face;
    withId('hud').innerHTML = render(Object.assign({}, face.data, { a, b, c }));
};

const bindHandlers = element => element.addEventListener('click', update);

module.exports = { bindHandlers };
