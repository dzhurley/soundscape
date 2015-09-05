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

let facePlotter = require('./faces');
let looper = require('./looper');

class Plotter {
    constructor() {
        this.remaining = [];
        Dispatch.on('plot.*', (method, payload) => this[method](payload));
    }

    newFaces(faces) {
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
        this.remaining.filter((f) => Object.keys(newFaces).indexOf('' + f) < 0);

        return newFaces;
    }

    stringifyNewFaces() {
        return JSON.stringify(this.newFaces(self.globe.geometry.faces));
    }

    seedArtists(data) {
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
        let seeds = self.globe.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);

        for (let i in seedIndices) {
            // specifically plot one artist on one face
            this.processOneArtist([ seedIndices[i] ]);
        }

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, facePlotter.faces().length - 1);
        this.remaining = randos.filter((r) => seedIndices.indexOf(r) < 0);
    }

    processOneArtist(remaining = this.remaining) {
        return looper.loopOnce(remaining);
    }

    processBatch(batchSize = ArtistManager.artistsRemaining()) {
        for (let i = 0; i <= batchSize; i++) {
            if (this.processOneArtist()) break;
        }
    }

    respondWithPainted() {
        // TODO: send back progress
        postMessage({
            type: 'faces.painted',
            payload: { faces: this.stringifyNewFaces() }
        });
    }

    // from events

    seed(payload) {
        this.seedArtists(JSON.parse(payload));
        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: { faces: this.stringifyNewFaces() }
        });
    }

    one() {
        this.processOneArtist();
        this.respondWithPainted();
    }

    batch() {
        let done = this.processBatch();
        this.respondWithPainted();
        return done;
    }

    all() {
        for (let i = 0; i < this.remaining.length; i++) {
            if (this.batch()) break;
        }
    }
}

module.exports = new Plotter();
