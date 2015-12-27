'use strict';

/* Manages the seeding of the artists on the globe and batches
 * out further painting based on incoming events
 *
 * After each cycle through painting more faces, the new faces
 * are sent back to the main thread for update.
 */

const { nextArtist, artistsLeft } = require('../artists');
const { faces } = require('../three/globe');
const facePlotter = require('./faces');
const { prepareData, seedIndices } = require('./seeder');
const { randomBoundedArray } = require('../helpers');

// WebWorker-wide list of remaining face indices yet to be painted
self.remaining = [];

const setNewFace = (face, artist) => {
    // TODO: doesn't belong here
    face.color.set(artist.color);
    face.data.artist = artist.name;
    face.data.plays = artist.playCount;
    face.data.pending = true;
    artist.faces--;
};

const runIteration = remaining => {
    let rando = remaining[0];
    let artist;
    let faceInfo;
    let remainingIndex;

    // choose random face for each face to paint
    artist = nextArtist();
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
};

const iterate = (remaining = self.remaining) => {
    let startingLength = remaining.length;
    let iterationResult = runIteration(remaining);
    if (startingLength === remaining.length) {
        // no paints on this pass, no use trying again
        return true;
    }
    console.log('remaining', remaining.length);
    return iterationResult;
};

const getNewFaces = faces => {
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
};

const respondWithFaces = (event = 'painted') => {
    // TODO: send back progress
    postMessage({
        type: `faces.${event}`,
        payload: { faces: JSON.stringify(getNewFaces(faces())) }
    });
};

const seed = payload => {
    let data = JSON.parse(payload);

    if (!data.length) {
        // TODO: find a nicer way
        console.error('user has no plays');
        return [];
    }

    // seed the planet
    prepareData(data);
    let seeds = seedIndices().map(s => iterate([s]));

    // set remaining faces to paint
    let randos = randomBoundedArray(0, faces().length - 1);
    self.remaining = randos.filter(r => seeds.indexOf(r) < 0);

    respondWithFaces('seeded');
};

const one = () => {
    iterate();
    respondWithFaces();
};

const batch = () => {
    for (let i = 0; i <= artistsLeft().length; i++) {
        if (iterate()) break;
    }
    respondWithFaces();
};

const all = () => {
    for (let i = 0; i < self.remaining.length; i++) {
        if (batch()) break;
    }
};

module.exports = { seed, one, batch, all };
