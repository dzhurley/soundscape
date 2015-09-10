'use strict';

/* Manages the seeding of the artists on the globe and batches
 * out further painting based on incoming Dispatch events
 *
 * After each cycle through painting more faces, the new faces
 * are sent back to the main thread for update.
 */

let h = require('../helpers');

let ArtistManager = require('../artists');
let globe = require('../three/globe');
let facePlotter = require('./faces');

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
    let newFaces = faces.map((face) => {
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
    }).filter((face) => !!face);

    // remove the newly painted face indices from the remaining list
    self.remaining.filter((f) => Object.keys(newFaces).indexOf('' + f) < 0);

    return newFaces;
}

function respondWithFaces(event = 'painted') {
    // TODO: send back progress
    postMessage({
        type: `faces.${event}`,
        payload: { faces: JSON.stringify(getNewFaces(globe.geometry.faces)) }
    });
}

self.remaining = [];

module.exports = {
    seed(payload) {
        let data = JSON.parse(payload);

        if (!data.length) {
            // TODO: find a nicer way
            console.error('user has no plays');
            return [];
        }

        ArtistManager.setArtists({
            artists: data,
            totalFaces: globe.geometry.faces.length
        });

        globe.geometry.faces.map((face) => face.data = {});

        // seed the planet
        let seeds = globe.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);

        for (let i in seedIndices) {
            // specifically plot one artist on one face
            iterate([ seedIndices[i] ]);
        }

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, globe.geometry.faces.length - 1);
        self.remaining = randos.filter((r) => seedIndices.indexOf(r) < 0);

        respondWithFaces('seeded');
    },

    one() {
        iterate();
        respondWithFaces();
    },

    batch() {
        for (let i = 0; i <= ArtistManager.artistsRemaining(); i++) {
            if (iterate()) break;
        }
        respondWithFaces();
    },

    all() {
        for (let i = 0; i < self.remaining.length; i++) {
            if (this.batch()) break;
        }
    }
};
