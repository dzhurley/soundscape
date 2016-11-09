const { Mesh, Raycaster, Sprite, SpriteMaterial } = require('three');

const constants = require('../constants');
const { artists, artistsLeft, setArtists } = require('../artists');
const { equidistantishPointsOnSphere } = require('../helpers');
const { faces, globe, position } = require('../three/globe');
const scene = require('../three/scene');

const { startForce } = require('../seeding/force');

let { globe: { radius }, node: { geometry, material } } = constants;

const prepareData = data => {
    setArtists(data);
    faces().map(face => face.data = {});
};

const createNode = ({ name, faces: charge, color } = {}) => {
    let node = new Mesh(geometry, material(color));
    node.name = name;
    node.charge = charge;
    return node;
};

const createGraph = data => {
    let nodeSet = new Set();
    let points = equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = createNode(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodeSet.add(targetNode);
        scene.add(targetNode);
    }

    startForce(nodeSet);
};

const forceSeed = payload => {
    prepareData(JSON.parse(payload));
    createGraph(artists());
};

const addEquidistantMarks = num => {
    return equidistantishPointsOnSphere(num).map(p => {
        let mark = new Sprite(new SpriteMaterial());
        mark.position.set(...p);
        mark.position.multiplyScalar(radius + 2);
        scene.add(mark);
        return mark;
    });
};

const equidistantFaces = numMarkers => {
    // add transient helper marks
    let markers = addEquidistantMarks(numMarkers);
    let caster = new Raycaster();
    let intersectingFaces = [];

    // use the mark's vector as a ray to find the closest face
    // via its intersection
    markers.map(m => {
        caster.set(position(), m.position.normalize());
        intersectingFaces.push(caster.intersectObject(globe));
    });

    // clean up transient markers
    markers.map(mark => scene.remove(mark));

    // return at most one face for each intersection
    return intersectingFaces.map(hit => hit[0]);
};

const seedIndices = () => equidistantFaces(artistsLeft().length).map(seed => seed.faceIndex);

module.exports = { prepareData, seedIndices, forceSeed };
