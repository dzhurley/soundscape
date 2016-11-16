const THREE = require('three');

const constants = require('constants');
const { equidistantishPointsOnSphere } = require('helpers');
const scene = require('three/scene');

const { startForce, iterateForce, iterating } = require('seeding/force');

const { globe: { radius }, node: { geometry, material } } = constants;

const nodes = new Set();

const createNode = ({ name, weight, color } = {}) => {
    const node = new THREE.Mesh(geometry, material(color));
    node.name = name;
    node.charge = weight;
    return node;
};

const animate = () => {
    iterating() && iterateForce();
};

const create = data => {
    const points = equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = createNode(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        targetNode.scale.multiplyScalar(1 + targetNode.charge);

        nodes.add(targetNode);
        scene.add(targetNode);
    }

    startForce(nodes);
};

module.exports = { animate, create };
