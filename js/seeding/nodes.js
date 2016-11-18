const THREE = require('three');
THREE.ConvexGeometry = require('exports?THREE.ConvexGeometry!three/examples/js/geometries/ConvexGeometry');

const constants = require('constants');
const { equidistantishPointsOnSphere } = require('helpers');
const scene = require('three/scene');

const { startForce, iterateForce, iterating } = require('seeding/force');
const bindPainter = require('seeding/paint');

const { globe: { radius }, node: { geometry, material } } = constants;

const nodes = new Set();

const createNode = ({ name, weight, color } = {}) => {
    const node = new THREE.Mesh(geometry(), material(color));
    node.name = name;
    node.charge = weight;
    return node;
};

const animate = () => {
    nodes.forEach(n => {
        n.lookAt(scene.position);
        n.rotateX(Math.PI / 2);
    });
    iterating() && iterateForce();
};

const create = data => {
    const points = equidistantishPointsOnSphere(data.length);

    for (let i in data) {
        let targetNode = createNode(data[i]);
        targetNode.position.set(...points[i]);
        targetNode.position.multiplyScalar(radius);

        nodes.add(targetNode);
        scene.add(targetNode);
    }

    bindPainter();
    startForce(nodes);
};

module.exports = { animate, create, nodes };
