const THREE = require('three');
const TWEEN = require('tween.js');

const { on } = require('dispatch');
const constants = require('constants');
const scene = require('three/scene');

const { seeds: { animations, geometry, material, morphTargetInfluences } } = constants;

let seeds;

const move = positions => {
    positions.map((position, index) => {
        const { r, g, b } = position.color;
        seeds.children[index].material.color.setRGB(r, g, b);
        seeds.children[index].data = position.data;
        animations.move(seeds.children[index].position, position).start();
    });
};

const show = positions => {
    seeds = new THREE.Group();

    positions.map(position => {
        const seed = new THREE.Mesh(geometry, material());
        seed.position.set(...position);

        animations.show(seed.position).start();
        seeds.add(seed);
    });

    scene.add(seeds);
};

const sink = (artist, paintFaces) => {
    const seed = seeds.children.find(seed => seed.data.artist === artist);
    animations.sink(seed.position).onComplete(paintFaces).start();
};

const animate = () => {
    TWEEN.update();
    if (seeds) seeds.children.map(morphTargetInfluences);
};

const create = () => {
    on('seed', show);
    on('seeded', move);
    on('painted', () => scene.remove(seeds));
};

module.exports = { animate, create, sink };
