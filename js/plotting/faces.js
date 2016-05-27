'use strict';

/* Meat of traversal to find the next face to paint for a given artist
 *
 * If this isn't the first paint for an artist, we search through the
 * edges of the existing faces for the artist and try to grow its
 * region. If no edge can immediately be painted, we offload swapping
 * work to Swapper.
 *
 */

const { faceCentroid, randomArray } = require('../helpers');
const { faces, globe } = require('../three/globe');

// compute the distance between each one of the candidates and the target
// to find the closest candidate
const findClosestFace = (candidates, target) => {
    let closest, newDistance, lastDistance, targetCentroid;
    for (let i = 0; i < candidates.length; i++) {
        let faceVector = faceCentroid(globe, candidates[i]).normalize();
        targetCentroid = faceCentroid(globe, target).normalize();
        newDistance = targetCentroid.distanceTo(faceVector);
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

// Handle case where no free adjacent faces were found to paint.
// We find an edge-wise path from the face that needs to swap to
// the nearest free face, then travel back along the path and swap
// each face with its predecessor until we've bubbled the entire
// path out.
const handleSwappers = startFace => {
    let goal = findClosestFace(faces().filter(f => !f.data.artist), startFace);
    let currentFace = startFace;
    let candidates = [];
    let path = [currentFace];

    while (currentFace !== goal) {
        candidates = self.HEDS.adjacentFaces(currentFace);
        currentFace = findClosestFace(candidates, goal);
        path.push(currentFace);
    }

    return path.reverse().map((face, index) => {
        let prevFace = path[index + 1];
        if (prevFace) {
            face.data = Object.assign({}, prevFace.data);
            face.color.copy(prevFace.color);
        }
        return face;
    });
};

const isBorderFace = test => {
    // TODO: keep separate list on artist for outer faces?
    // Assume it's not a border face. Once we find a face
    // with a different artist (or none) we flip to true.
    return self.HEDS.adjacentFaces(test).reduce((onBorder, face) => {
        return onBorder || test.data.artist !== face.data.artist;
    }, false);
};

const findAdjacentFaces = artist => {
    const borderFaces = randomArray(artist.faces.filter(isBorderFace));

    let match;
    for (let borderFace of borderFaces) {
        // check borders for free spot
        match = self.HEDS.adjacentFaces(borderFace).find(adj => !adj.data.artist);
        if (match) break;
    }

    if (match) return [match];

    console.log(`handle swappers for ${borderFaces[0].data.artist}`);
    return handleSwappers(borderFaces[0]);
};

const setNewFaceForArtist = artist => face => {
    face.color.set(artist.color);
    face.data.artist = artist.name;
    face.data.plays = artist.playCount;
    face.data.pending = true;
    artist.faces.push(face);
    return face;
};

const handleNextFaces = (artist, rando) => {
    const face = faces()[rando];

    // the face is already painted, we're done
    if (face.data.artist === artist.name) return [];

    // If we've got faces, we need to find our next adjacent face. Otherwise
    // this is the first face for the artist so we use it.
    const newFaces = artist.faces.length ? findAdjacentFaces(artist) : [face];

    // paint faces and update artist as we return
    return newFaces.map(setNewFaceForArtist(artist)).map(f => faces().indexOf(f));
};

module.exports = { handleNextFaces };
