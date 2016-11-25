const THREE = require('three');

const { on } = require('dispatch');
const { globe: { radius } } = require('constants');
const scene = require('three/scene');

const seeds = new THREE.Group();

const positionSeeds = positions => {
    positions.map((position, index) => {
        // TODO: tween
        const { r, g, b } = position.color;
        seeds.children[index].material.color.setRGB(r, g, b);
        seeds.children[index].data = position.data;
        seeds.children[index].position.set(position.x, position.y, position.z);
    });
};

const showSeeds = positions => {
    positions.map(position => {
        const seed = new THREE.Mesh(
            new THREE.SphereBufferGeometry(20, 20, 20),
            // TODO: fluctuate color until positionSeeds()
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        seed.position.set(...position);
        seed.position.multiplyScalar(radius);
        seeds.add(seed);
    });

    scene.add(seeds);
    on('paint', () => scene.remove(seeds));
};

module.exports = { positionSeeds, showSeeds };
