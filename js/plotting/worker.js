'use strict';

/* Manages the seeding of the artists on the globe and batches
 * out further painting based on incoming Dispatch events
 *
 * After each cycle through painting more faces, the new faces
 * are sent back to the main thread for update.
 */

let h = require('../helpers');

let Dispatch = require('../dispatch');
let ArtistManager = require('../artists');
let globe = require('../three/globe');

let facePlotter = require('./faces');
let looper = require('./looper');

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

function stringifyNewFaces() {
    return JSON.stringify(getNewFaces(globe.geometry.faces));
}

function processOneArtist(left = self.remaining) {
    return looper.loopOnce(left);
}

function processBatch(batchSize = ArtistManager.artistsRemaining()) {
    for (let i = 0; i <= batchSize; i++) {
        if (processOneArtist()) break;
    }
}

function respondWithPainted() {
    // TODO: send back progress
    postMessage({
        type: 'faces.painted',
        payload: { faces: stringifyNewFaces() }
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
            totalFaces: facePlotter.faces().length
        });

        facePlotter.faces().map((face) => face.data = {});

        // seed the planet
        let seeds = globe.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);

        for (let i in seedIndices) {
            // specifically plot one artist on one face
            processOneArtist([ seedIndices[i] ]);
        }

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, facePlotter.faces().length - 1);
        self.remaining = randos.filter((r) => seedIndices.indexOf(r) < 0);

        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: { faces: stringifyNewFaces() }
        });
    },

    one() {
        processOneArtist();
        respondWithPainted();
    },

    batch() {
        let done = processBatch();
        respondWithPainted();
        return done;
    },

    all() {
        for (let i = 0; i < self.remaining.length; i++) {
            if (this.batch()) break;
        }
    }
};
