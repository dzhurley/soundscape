const THREE = require('three');
THREE.HalfEdgeStructure = require('exports?THREE.HalfEdgeStructure!lib/HalfEdgeStructure');

const { globe: { radius, widthAndHeight } } = require('constants');
const { emitOnMain, on } = require('dispatch');

// local geometry-only globe so main/worker globes aren't shared
const globe = new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight);
const heds = new THREE.HalfEdgeStructure(globe);

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

const mainInfoFor = face => ({ color: face.color, data: face.data, index: face.index });

const paint = vertices => {
    // paint each face the color of the closest seed, giving each face should
    // have its own copy of the closest data
    globe.faces.map((face, index) => {
        const { closest, distance } = findClosestSeed(vertices, face);
        updateArtistCenter(closest.data.artist, distance, index);
        face.color.set(closest.color);
        face.data = Object.assign({}, closest.data);
        face.index = index;
    });

    Object.keys(artistCenters).map(artist => {
        // mark center of artist territory (used in autocomplete)
        const center = globe.faces[artistCenters[artist].index];
        center.data.center = true;

        const searched = [center];
        searched[0].distance = 0;

        const pending = [];
        pending.push(mainInfoFor(center));

        while (searched.length) {
            let current = searched.shift();
            for (let adj of heds.adjacentFaces(current)) {
                if (typeof adj.distance == 'undefined' && adj.data.artist === center.data.artist) {
                    adj.distance = current.distance + 1;
                    adj.parent = current;
                    searched.push(adj);
                    pending.push(mainInfoFor(adj));
                }
            }
        }

        // TODO: this takes 5 seconds and should be faster
        emitOnMain('paint', pending);
    });

    // grab any faces the bfs adjacency checks might have missed
    emitOnMain('gaps', globe.faces.reduce((memo, face) => {
        if (typeof face.distance == 'undefined') {
            memo.push(mainInfoFor(face));
        }
        return memo;
    }, []));
};

const bindPainter = () => on('seeded', paint);

module.exports = bindPainter;
