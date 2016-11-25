const THREE = require('three');

const { globe: { radius, widthAndHeight } } = require('constants');
const { emitOnMain, on } = require('dispatch');

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

const paint = vertices => {
    // paint each face the color of the closest seed, giving each face should
    // have its own copy of the closest data
    const pending = globe.faces.map((face, index) => {
        const { closest, distance } = findClosestSeed(vertices, face);
        updateArtistCenter(closest.data.artist, distance, index);
        return { color: closest.color, data: Object.assign({}, closest.data), index };
    });

    // mark center of artist territory (used in autocomplete)
    Object.keys(artistCenters).map(artist => {
        pending[artistCenters[artist].index].data.center = true;
    });

    // TODO: this takes 5 seconds and should be faster
    emitOnMain('paint', pending);
};

const bindPainter = () => on('seeded', paint);

module.exports = bindPainter;
