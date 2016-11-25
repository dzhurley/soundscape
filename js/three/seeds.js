const THREE = require('three');
const TWEEN = require('tween.js');

const { on } = require('dispatch');
const { globe: { radius } } = require('constants');
const scene = require('three/scene');

const seeds = new THREE.Group();

const positionSeeds = positions => {
    positions.map((position, index) => {
        const { r, g, b } = position.color;
        seeds.children[index].material.color.setRGB(r, g, b);
        seeds.children[index].data = position.data;

        const { x, y, z } = position;
        const target = seeds.children[index].position;
        const align = new TWEEN.Tween(target).to({ x, y, z }, 6000);
        const sink = new TWEEN.Tween(target).to({ x: 0, y: 0, z: 0 }, 12000).delay(2000);
        align.chain(sink).start();
    });
};

const showSeeds = positions => {
    positions.map(position => {
        const seed = new THREE.Mesh(
            new THREE.SphereBufferGeometry(20, 20, 20),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        seed.position.set(...position);
        seed.position.multiplyScalar(radius - 40);
        seeds.add(seed);

        const { x, y, z } = seed.position.clone().multiplyScalar(1.25);
        new TWEEN.Tween(seed.position).to({ x, y, z }, 2000).start();
    });

    scene.add(seeds);
    on('paint', () => scene.remove(seeds));
};

const animate = () => {
    TWEEN.update();
};

const create = () => {
    on('seed', showSeeds);
    on('seeded', positionSeeds);
};

module.exports = { animate, create };
