const THREE = require('three');
THREE.HalfEdgeStructure = require('exports?THREE.HalfEdgeStructure!lib/HalfEdgeStructure');

const { globe: { pendingFaceChunk, radius, widthAndHeight } } = require('constants');
const { emitOnMain } = require('dispatch');

// object keyed by artist containing the closest face index to a given seed,
// of the form: { [name]: { distance, index }, ... }
let artistCenters;

// check distance between target and all candidates to find closest one
const findClosestSeed = (candidates, target) => {
    let closest, newDistance, lastDistance;
    for (let i = 0; i < candidates.length; i++) {
        newDistance = target.normal.distanceTo(candidates[i]);
        if (!closest || newDistance < lastDistance) {
            closest = candidates[i];
            lastDistance = newDistance;
        }
    }
    return { closest, distance: lastDistance };
};

// track artistCenters with outcomes of findClosestSeed
const updateArtistCenter = (artist, distance, index) => {
    const entry = artistCenters[artist];
    if (!entry || entry.distance >= distance) {
        artistCenters[artist] = { distance, index };
    }
};

// deal in serializable data instead of potentially cyclic THREE types
const mainInfoFor = face => ({ color: face.color, data: face.data, index: face.index });

// apply a breadth first search using the HalfEdgeStructure to map out, in order,
// all faces that belong to a specific artist for painting in the main thread
const breadthFirstPaint = (center, heds) => {
    const searched = [center];
    searched[0].distance = 0;

    // keep track of distanced faces
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

    return pending;
};

const paint = vertices => {
    // reset on each paint for each new user
    artistCenters = {};

    // local geometry-only globe so main/worker globes aren't shared
    const globe = new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight);
    const heds = new THREE.HalfEdgeStructure(globe);

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

        const pending = breadthFirstPaint(center, heds);

        // cheap stepped loop to chunk out artists that have too many faces
        for (let i = 1; i < pending.length; i++) {
            const chunk = pending.slice(pendingFaceChunk * (i - 1), pendingFaceChunk * i);
            emitOnMain('paint', chunk);
            if (chunk.length < pendingFaceChunk) break;
        }
    });

    // grab any faces the bfs adjacency checks might have missed
    emitOnMain('gaps', globe.faces.reduce((memo, face) => {
        if (typeof face.distance == 'undefined') {
            memo.push(mainInfoFor(face));
        }
        return memo;
    }, []));
};

module.exports = { paint };
