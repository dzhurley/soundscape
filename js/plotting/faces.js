/* Meat of traversal to find the next face to paint for a given artist
 *
 * If this isn't the first paint for an artist, we search through the
 * edges of the existing faces for the artist and try to grow its
 * region. If no edge can immediately be painted, we offload swapping
 * work to Swapper.
 *
 */

const { faceCentroid, randomArray } = require('helpers');
const { faces, globe } = require('three/globe');
const { artistForName } = require('artists');

const updateFaceAndArtist = (artist, face) => {
    face.color.set(artist.color);
    face.data.artist = artist.name;
    face.data.plays = artist.playCount;
    face.data.pending = true;
    artist.faces.push(face);
    return faces().indexOf(face);
};

const normal = (mesh, face) => faceCentroid(mesh, face).normalize();

// compute the distance between each one of the candidates and the target
// to find the closest candidate
const findClosestFace = (candidates, target) => {
    let closest, newDistance, lastDistance;
    for (let i = 0; i < candidates.length; i++) {
        newDistance = normal(globe, target).distanceTo(normal(globe, candidates[i]));
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

const findShortestPair = (border, free) => border.map(face => {
    const closest = findClosestFace(free, face);
    return {
        distance: normal(globe, closest).distanceTo(normal(globe, face)),
        goal: closest,
        start: face
    };
}).reduce((memo, pair) => memo.distance > pair.distance ? pair : memo, { distance: 1000 });

// Handle case where no free adjacent faces were found to paint.
const handleSwappers = borderFaces => {
    const freeFaces = faces().filter(f => !f.data.artist);
    const { start, goal } = findShortestPair(borderFaces, freeFaces);

    let currentFace = start;
    const path = [];

    // we find an edge-wise path from the first new face to the nearest free face (goal)
    while (currentFace !== goal) {
        let candidates = self.HEDS.adjacentFaces(currentFace);
        currentFace = findClosestFace(candidates, goal);
        path.push(currentFace);
    }
    path.push(goal);

    // bubble out artist and face information along the path to the free face
    return path.map((face, index) => {
        let prevFace = index === 0 ? start : path[index - 1];
        let prevArtist = artistForName(prevFace.data.artist);
        let artist = artistForName(face.data.artist);

        // remove face from face's artist list in prep for swap
        if (artist) artist.faces.splice(artist.faces.indexOf(face), 1);

        // swap previous face into current and add to previous face's artist list
        return updateFaceAndArtist(prevArtist, face);
    });
};

const findAdjacentFaces = borderFaces => {
    for (let borderFace of borderFaces) {
        // check borders for free spot
        let match = self.HEDS.adjacentFaces(borderFace).find(adj => !adj.data.artist);
        if (match) return [match];
    }
};

const isBorderFace = test => {
    // Assume it's not a border face. Once we find a face with a different artist
    // (or none) we flip to true.
    return self.HEDS.adjacentFaces(test).reduce((onBorder, face) => {
        return onBorder || test.data.artist !== face.data.artist;
    }, false);
};

const handleNextFaces = (artist, rando) => {
    const face = faces()[rando];

    // the face is already painted, we're done
    if (face.data.artist === artist.name) return [];

    // otherwise this is the first face for the artist so we use it
    if (!artist.faces.length) return [face].map(face => updateFaceAndArtist(artist, face));

    // if we've got faces, we need to find our next adjacent face
    const borderFaces = randomArray(artist.faces.filter(isBorderFace));
    const newFaces = findAdjacentFaces(borderFaces);

    if (!newFaces) {
        // we didn't find a free adjacent face, so swap out until we find one
        console.log(`handle swappers for ${borderFaces[0].data.artist}`);
        return handleSwappers(borderFaces);
    }

    // paint faces, update artist, and return indices for self.remaining
    return newFaces.map(face => updateFaceAndArtist(artist, face));
};

module.exports = { handleNextFaces };
