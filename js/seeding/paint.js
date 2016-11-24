const THREE = require('three');

const { globe: { radius, widthAndHeight } } = require('constants');
const { on } = require('dispatch');
const scene = require('three/scene');

// local geometry-only globe so main/worker globes aren't shared
const globe = new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight);

// { [name]: { distance, index } }
const artistCenters = {};

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
    return { closest, distance: lastDistance };
};

const updateArtistCenter = (artist, distance, index) => {
    const entry = artistCenters[artist];
    if (!entry || entry.distance >= distance) {
        artistCenters[artist] = { distance, index };
    }
};

const paint = seeds => {
    const vertices = seeds.map(seed => {
        seed.position.color = seed.material.color;
        seed.position.data = { artist: seed.name };
        return seed.position;
    });

    // paint each face the color of the closest seed
    const pending = globe.faces.map((face, index) => {
        const { closest, distance } = findClosestSeed(vertices, face);
        updateArtistCenter(face, distance, index);
        return { color: closest.color, data: closest.data, index };
    });

    // mark center of artist territory (used in autocomplete)
    pending.map((face, index) => face.center = index === face.index);

    seeds.map(seed => scene.remove(seed));
    postMessage({ type: 'paint', payload: pending });
};

const bindPainter = () => on('paint', paint);

module.exports = bindPainter;
