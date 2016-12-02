// Transient seeds that move around to show where faces on the globe
// will be painted, mostly to provide some entertainment while the
// worker thread finding all the faces finishes

const THREE = require('three');
const TWEEN = require('tween.js');

const animations = require('animations');
const constants = require('constants');
const { on } = require('dispatch');
const scene = require('three/scene');

const { seeds: { geometry, material, morphTargetInfluences } } = constants;

let seeds;

// start with equidistant pulsating seeds
const show = positions => {
    seeds = new THREE.Group();

    positions.map(position => {
        const seed = new THREE.Mesh(geometry, material());
        seed.position.set(...position);

        animations.seeds.show(seed.position).start();
        seeds.add(seed);
    });

    scene.add(seeds);
};

// position/color seeds based on info from the force layout in the worker
const move = positions => {
    positions.map((position, index) => {
        const { r, g, b } = position.color;
        seeds.children[index].material.color.setRGB(r, g, b);
        seeds.children[index].data = position.data;
        animations.seeds.move(seeds.children[index].position, position).start();
    });
};

// pull the seeds into the globe and paint once they've entered
const sink = (artist, paintFaces) => {
    const seed = seeds.children.find(seed => seed.data.artist === artist);
    animations.seeds.sink(seed.position).onComplete(paintFaces).start();
};

const animate = () => {
    TWEEN.update();
    // pulsate the seeds
    if (seeds) seeds.children.map(morphTargetInfluences);
};

const create = () => {
    on('seed', show);
    on('seeded', move);
    on('painted', () => scene.remove(seeds));
};

module.exports = { animate, create, sink };
