const { emit, on } = require('dispatch');
const scene = require('three/scene');
const { globe } = require('three/globe');

// { [name]: { faceIndex, distance } }
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

const updateArtistCenter = (face, distance) => {
    const entry = artistCenters[face.data.artist];
    if (!entry || entry.distance >= distance) {
        artistCenters[face.data.artist] = { distance, index: globe.geometry.faces.indexOf(face) };
    }
};

const paint = seeds => {
    const vertices = seeds.map(seed => {
        seed.position.color = seed.material.color;
        seed.position.data = { artist: seed.name };
        return seed.position;
    });

    // paint each face the color of the closest seed
    globe.geometry.faces.map(face => {
        const { closest, distance } = findClosestSeed(vertices, face);
        face.color.set(closest.color);
        Object.assign(face.data, closest.data);
        updateArtistCenter(face, distance);
    });

    // mark center of artist territory (used in autocomplete)
    Object.keys(artistCenters).map(artist => {
        globe.geometry.faces[artistCenters[artist].index].data.center = true;
    });

    seeds.map(seed => scene.remove(seed));
    globe.geometry.colorsNeedUpdate = true;

    emit('painted');
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
