const THREE = require('three');
const TWEEN = require('tween.js');

const { on } = require('dispatch');
const { globe: { radius } } = require('constants');
const scene = require('three/scene');

let seeds;

// TODO: constants throughout
const positionSeeds = positions => {
    positions.map((position, index) => {
        const { r, g, b } = position.color;
        seeds.children[index].material.color.setRGB(r, g, b);
        seeds.children[index].data = position.data;

        const { x, y, z } = position;
        new TWEEN.Tween(seeds.children[index].position)
            .to({ x, y, z }, 1000)
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
    });
};

const showSeeds = positions => {
    seeds = new THREE.Group();

    positions.map(position => {
        const seed = new THREE.Mesh(
            new THREE.SphereBufferGeometry(10, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0x888888, morphTargets: true })
        );

        seed.position.set(...position);
        seed.position.multiplyScalar(radius - 40);
        seeds.add(seed);

        const { x, y, z } = seed.position.clone().multiplyScalar(1.25);
        new TWEEN.Tween(seed.position)
            .to({ x, y, z }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .delay(Math.random() * 1000)
            .start();
    });

    scene.add(seeds);
};

const sink = (artist, paintFaces) => {
    const seed = seeds.children.find(seed => seed.data.artist === artist);
    new TWEEN.Tween(seed.position)
        .to({
            x: seed.position.x / 1.1,
            y: seed.position.y / 1.1,
            z: seed.position.z / 1.1,
        }, 1000)
        .onComplete(paintFaces)
        .start();
};

const animate = () => {
    TWEEN.update();
    const time = Date.now() * 0.001;
    if (seeds) seeds.children.map(seed => seed.morphTargetInfluences = [Math.sin(4 * time) / 4]);
};

const create = () => {
    on('seed', showSeeds);
    on('seeded', positionSeeds);
    on('painted', () => scene.remove(seeds));
};

module.exports = { animate, create, sink };
