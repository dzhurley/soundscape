const THREE = require('three');

const constants = require('constants');
const { emitOnMain, on } = require('dispatch');
const { equidistantPointsOnSphere, normalizeAgainst, spacedColor } = require('helpers');
const scene = require('three/scene');

const { startForce } = require('seeding/force');

const { globe: { radius }, node: { geometry, material } } = constants;

const createNode = ({ name, weight, color } = {}) => {
    const node = new THREE.Mesh(geometry(), material(color));
    node.name = name;
    node.charge = weight;
    return node;
};

// normalize artist's play count into weights used for the force layout
const processArtists = data => {
    const normCount = normalizeAgainst(data.map(d => d.playCount));
    return data.map((artist, i) => {
        const weight = normCount(artist.playCount);
        // assign color randomly, changing intensity based on play frequency
        const baseColor = new THREE.Color(spacedColor(data.length, i));
        return Object.assign(artist, { color: baseColor.multiplyScalar(weight), weight });
    });
};

// transform artist info into nodes for forcing
const seed = data => {
    // start with blank equidistant points to show on screen fast
    const points = equidistantPointsOnSphere(data.length);
    emitOnMain('seed', points);

    const artists = processArtists(data);
    const nodes = new Set();

    // load nodes with artist info and point positions
    for (let i in artists) {
        let targetNode = createNode(artists[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodes.add(targetNode);
        scene.add(targetNode);
    }

    // hand off to force layout
    startForce(nodes);
};

const create = () => on('seed', data => seed(JSON.parse(data)));

module.exports = { create };
