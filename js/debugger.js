const THREE = require('three');

const { globe: { axisSize }, labels } = require('constants');
const { faceCentroid, intersectObject } = require('helpers');
const { getCamera } = require('three/camera');
const { faces, globe, vertices } = require('three/globe');
const { renderer } = require('three/main');

const scene = require('three/scene');

let active = false;

const sceneHelpers = [new THREE.AxisHelper(axisSize)];

const objectHelpers = [{ object: globe, helper: new THREE.WireframeHelper(globe) }];

const labelProps = Object.keys(labels).reduce((memo, key) => {
    memo[key] = isNaN(labels[key]) ? labels[key] : +labels[key];
    return memo;
}, {});

// TODO: favor dom over canvas for tooltips
const makeMark = message => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = labelProps.canvasHeightWidth;
    let context = canvas.getContext('2d');

    const { fontface, fontsize } = labelProps;

    context.font = `${fontsize}px ${fontface}`;

    const textWidth = context.measureText(message).width;
    if (textWidth > canvas.width) {
        canvas.width = canvas.height = textWidth;
        context = canvas.getContext('2d');
        context.font = `${fontsize}px ${fontface}`;
    }

    context.fillStyle = labelProps.backgroundColor;
    context.fillRect(canvas.width * 0.25,
                     canvas.height / 2 - fontsize,
                     canvas.width * 0.5,
                     canvas.height / 3);

    context.fillStyle = labelProps.color;
    context.textAlign = 'center';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const map = new THREE.Texture(canvas);
    map.needsUpdate = true;
    return new THREE.Sprite(new THREE.SpriteMaterial({ map, name: 'marker' }));
};

const addVertexMarkers = vs => vs.map(index => {
    const mark = makeMark(JSON.stringify(index));
    mark.position.copy(vertices()[index].clone().multiplyScalar(labelProps.radius));
    scene.add(mark);
});

const addFaceMarkers = face => {
    const mark = makeMark(faces().indexOf(face));
    mark.position.copy(faceCentroid(globe, face).multiplyScalar(labelProps.radius));
    scene.add(mark);
};

const removeMarkers = () => scene.children
                                .filter(c => c.material && c.material.name === 'marker')
                                .map(c => scene.remove(c));

const updateMarks = evt => {
    const intersects = intersectObject(evt, globe, getCamera());
    if (!intersects.length) return false;

    const face = intersects[0].face;
    removeMarkers();
    addVertexMarkers([face.a, face.b, face.c]);
    addFaceMarkers(face);
};

const activate = () => {
    global.THREE = THREE;
    global.scene = scene;

    sceneHelpers.map(helper => scene.add(helper));
    objectHelpers.map(({ helper }) => scene.add(helper));

    renderer.domElement.addEventListener('click', updateMarks);
};

const deactivate = () => {
    delete global.THREE;
    delete global.scene;

    sceneHelpers.map(helper => scene.remove(helper));
    objectHelpers.map(({ helper }) => scene.remove(helper));

    removeMarkers();
    renderer.domElement.removeEventListener('click', updateMarks);
};

const debug = () => {
    active = !active;
    active ? activate() : deactivate();
};

module.exports = debug;
