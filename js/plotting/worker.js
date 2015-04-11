'use strict';

let h = require('../helpers');

let Dispatch = require('../dispatch');
let ArtistManager = require('../artists');

let FacePlotter = require('./faces');
let Looper = require('./looper');

class Plotter {
    constructor(mesh) {
        this.mesh = mesh;
        this.facePlotter = new FacePlotter(this.mesh);
        this.looper = new Looper(this.facePlotter);

        Dispatch.on('plot.*', (method, payload) => this[method](payload));
    }

    newFaces(faces) {
        return faces.map((face) => {
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
    }

    seedArtists(data) {
        if (!data.length) {
            // TODO: find a nicer way
            console.error('user has no plays');
            return [];
        }

        ArtistManager.setArtists({
            artists: data,
            totalFaces: this.facePlotter.faces.length
        });

        this.facePlotter.faces.map((face) => face.data = {});

        // seed the planet
        let seeds = this.mesh.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);

        for (let i in seedIndices) {
            // specifically plot one artist on one face
            this.processOneArtist([ seedIndices[i] ]);
        }

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, this.facePlotter.faces.length - 1);
        return randos.filter((r) => seedIndices.indexOf(r) < 0);
    }

    processOneArtist(remaining = this.remaining) {
        return this.looper.loopOnce(remaining);
    }

    processSizedBatch(batchSize = ArtistManager.artistsRemaining()) {
        for (let i = 0; i <= batchSize; i++) {
            if (this.processOneArtist()) {
                break;
            }
        }
    }

    respondWithPainted() {
        // TODO: send back progress
        postMessage({
            type: 'faces.painted',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    // from events

    seed(payload) {
        this.remaining = this.seedArtists(JSON.parse(payload));
        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    oneArtist() {
        this.processOneArtist();
        this.respondWithPainted();
    }

    batchOnce() {
        let done = this.processSizedBatch();
        this.respondWithPainted();
        return done;
    }

    batch() {
        for (let i = 0; i < this.remaining.length; i++) {
            if (this.batchOnce()) {
                break;
            }
        }
    }
}

module.exports = Plotter;
