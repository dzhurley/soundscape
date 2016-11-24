const THREE = require('three');

const constants = require('constants');
const { on } = require('dispatch');
const { equidistantishPointsOnSphere, normalizeAgainst, spacedColor } = require('helpers');
const scene = require('three/scene');

const { startForce } = require('seeding/force');
const bindPainter = require('seeding/paint');

const { globe: { radius }, node: { geometry, material } } = constants;

const nodes = new Set();

const createNode = ({ name, weight, color } = {}) => {
    const node = new THREE.Mesh(geometry(), material(color));
    node.name = name;
    node.charge = weight;
    return node;
};

const processArtists = data => {
    const normCount = normalizeAgainst(data.map(d => d.playCount));
    return data.map((artist, i) => {
        const weight = normCount(artist.playCount);
        const baseColor = new THREE.Color(spacedColor(data.length, i));
        // TODO: need to multiply?
        return Object.assign(artist, { color: baseColor.multiplyScalar(weight), weight });
    });
};

const create = data => {
    const points = equidistantishPointsOnSphere(data.length);
    const artists = processArtists(data);

    for (let i in artists) {
        let targetNode = createNode(artists[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodes.add(targetNode);
        scene.add(targetNode);
    }

    bindPainter();

    startForce(nodes);
};

on('seed', data => create(JSON.parse(data)));

module.exports = { create, nodes };
