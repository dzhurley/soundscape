const { emit, on } = require('dispatch');
const scene = require('three/scene');
const { globe } = require('three/globe');

const findClosestSeed = (candidates, target) => {
    let closest, newDistance, lastDistance;
    for (let i = 0; i < candidates.length; i++) {
        newDistance = target.normal.distanceTo(candidates[i]);
        if (!closest) {
            closest = candidates[i];
            lastDistance = newDistance;
        } else if (newDistance < lastDistance) {
            closest = candidates[i];
            lastDistance = newDistance;
        }
    }
    return closest;
};

const paint = seeds => {
    const vertices = seeds.map(seed => {
        seed.position.color = seed.material.color;
        seed.position.data = { artist: seed.name };
        return seed.position;
    });

    globe.geometry.faces.map(face => {
        const closest = findClosestSeed(vertices, face);
        face.color.set(closest.color);
        Object.assign(face.data, closest.data);
    });
    globe.geometry.colorsNeedUpdate = true;

    seeds.map(seed => scene.remove(seed));

    emit('painted');
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
