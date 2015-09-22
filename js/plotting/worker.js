'use strict';

/* Manages the seeding of the artists on the globe and batches
 * out further painting based on incoming Dispatch events
 *
 * After each cycle through painting more faces, the new faces
 * are sent back to the main thread for update.
 */

let ArtistManager = require('../artists');
let globe = require('../three/globe');
let facePlotter = require('./faces');

// WebWorker-wide list of remaining face indices yet to be painted
self.remaining = [];

function setNewFace(face, artist) {
    // TODO: doesn't belong here
    face.color.set(artist.color);
    face.data.artist = artist.name;
    face.data.plays = artist.playCount;
    face.data.pending = true;
    artist.faces--;
}

function runIteration(remaining) {
    let rando = remaining[0];
    let artist;
    let faceInfo;
    let remainingIndex;

    // choose random face for each face to paint
    artist = ArtistManager.nextArtist();
    if (!artist) {
        // no more faces left for any artist to paint
        return true;
    }
    faceInfo = facePlotter.nextFace(artist, rando);

    if (faceInfo.face) {
        remainingIndex = remaining.indexOf(faceInfo.index);
        if (remainingIndex > -1) {
            remaining.splice(remainingIndex, 1);
        }
        if (faceInfo.face !== true) {
            setNewFace(faceInfo.face, artist);
        }
    }
    return false;
}

function iterate(remaining = self.remaining) {
    let startingLength = remaining.length;
    let iterationResult = runIteration(remaining);
    if (startingLength === remaining.length) {
        // no paints on this pass, no use trying again
        return true;
    }
    console.log('remaining', remaining.length);
    return iterationResult;
}

function getNewFaces(faces) {
    let newFaces = faces.map(face => {
        let indexedFace = null;

        if (face.data.pending) {
            let index = faces.indexOf(face).toString();
            indexedFace = {};
            indexedFace[index] = {
                color: face.color,
                data: face.data
            };
            delete face.data.pending;
        }

        return indexedFace;
    }).filter(face => !!face);

    // remove the newly painted face indices from the remaining list
    self.remaining.filter(f => Object.keys(newFaces).indexOf('' + f) < 0);

    return newFaces;
}

function respondWithFaces(event = 'painted') {
    // TODO: send back progress
    postMessage({
        type: `faces.${event}`,
        payload: { faces: JSON.stringify(getNewFaces(globe.geometry.faces)) }
    });
}

function one() {
    iterate();
    respondWithFaces();
}

function batch() {
    for (let i = 0; i <= ArtistManager.artistsLeft(); i++) {
        if (iterate()) break;
    }
    respondWithFaces();
}

function all() {
    for (let i = 0; i < self.remaining.length; i++) {
        if (batch()) break;
    }
}

module.exports = { one, batch, all };
