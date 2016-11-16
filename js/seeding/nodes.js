const THREE = require('three');

const constants = require('constants');
const { equidistantishPointsOnSphere } = require('helpers');
const scene = require('three/scene');

const { startForce } = require('seeding/force');

let { globe: { radius }, node: { geometry, material } } = constants;

const createNode = ({ name, weight, color } = {}) => {
    let node = new THREE.Mesh(geometry, material(color));
    node.name = name;
    node.charge = weight;
    return node;
};

const animate = () => {
    // iterateForce();
};

const create = data => {
    let nodeSet = new Set();
    let points = equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = createNode(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        targetNode.scale.multiplyScalar(1 + targetNode.charge);

        nodeSet.add(targetNode);
        scene.add(targetNode);
    }

    startForce(nodeSet);
};

module.exports = { animate, create };
