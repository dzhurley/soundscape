const THREE = require('three');
THREE.ConvexGeometry = require('exports?THREE.ConvexGeometry!three/examples/js/geometries/ConvexGeometry');

const { on } = require('dispatch');
const scene = require('three/scene');

const applyConvex = vertices => {
    const hull = new THREE.Mesh(
        new THREE.ConvexGeometry(vertices),
        new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: true })
    );
    hull.scale.multiplyScalar(1.05);
    scene.add(hull);
};

const paint = vertices => {
    applyConvex(vertices);
    // TODO find voronoi, use globe face normals to paint
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
