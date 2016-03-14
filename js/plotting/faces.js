'use strict';

/* Meat of traversal to find the next face to paint for a given artist
 *
 * If this isn't the first paint for an artist, we search through the
 * edges of the existing faces for the artist and try to grow its
 * region. If no edge can immediately be painted, we offload swapping
 * work to Swapper.
 */

const { randomArray } = require('../helpers');
const { expandArtistEdges } = require('../artists');
const { findClosestFace, findClosestFreeFace, markForUpdate, faces } = require('../three/globe');

const handleSwappers = startFace => {
    // Handle case where no free adjacent faces were found to paint.
    // We find an edge-wise path from the face that needs to swap to
    // the nearest free face, then travel back along the path and swap
    // each face with its predecessor until we've bubbled the entire
    // path out.
    let goal = findClosestFreeFace(startFace);
    let currentFace = startFace;
    let candidates = [];
    let path = [currentFace];

    while (currentFace !== goal) {
        candidates = self.HEDS.adjacentFaces(currentFace);
        currentFace = findClosestFace(candidates, goal);
        path.push(currentFace);
    }

    let prevFace;
    path.reverse().forEach((face, index) => {
        prevFace = path[index + 1];
        if (prevFace) {
            // TODO: account for edge info, see expandArtistEdges
            face.data = Object.assign({}, prevFace.data);
            face.color.copy(prevFace.color);
        }
    });

    markForUpdate();
    return goal;
};

const findAdjacentFace = artist => {
    // use random `artist.edges` to find an adjacent unpainted `face`
    const randomEdges = randomArray(artist.edges);
    const match = randomEdges.find(edge => {
        const face = self.HEDS.faceForEdge(edge);
        // only match if it's a free face
        return face && !face.data.artist;
    });

    if (match) {
        const face = self.HEDS.faceForEdge(match);
        expandArtistEdges(face, artist, match);
        return { face, index: faces().indexOf(face) };
    }

    const randomFace = self.HEDS.faceForEdge(randomEdges[0]);
    console.log(`handling swappers for ${randomFace}`);
    handleSwappers(randomFace);
    return {
        // TODO: bad, do something better to return face states
        face: true,
        index: faces().indexOf(randomFace)
    };
};

const nextFace = (artist, rando) => {
    let face = faces()[rando];
    let paintedInfo = { artist };

    if (face.data.artist) return { face: false };

    if (!artist.edges.length) {
        artist.edges.push(...self.HEDS.outerEdgesForFace(face));
        return { face, index: faces().indexOf(face) };
    }

    // artist has been painted somewhere else
    while (!paintedInfo.face) {
        paintedInfo = findAdjacentFace(paintedInfo.artist);
    }
    return paintedInfo;
};

module.exports = { nextFace };
