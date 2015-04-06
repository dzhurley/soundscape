let h = require('../helpers');

let THREE = require('three');
let Dispatch = require('../dispatch');
let ArtistManager = require('../artists');

let Looper = require('./looper');
let FacePlotter = require('./faces');

class Plotter {
    constructor(mesh) {
        this.mesh = mesh;
        this.facePlotter = new FacePlotter(mesh);
        this.looper = new Looper(this.facePlotter, this);

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
            alert('user has no plays');
            return;
        }

        ArtistManager.setArtists({
            artists: data,
            totalFaces: this.facePlotter.faces.length
        });

        this.facePlotter.faces.map((face) => { face.data = {}; });

        // seed the planet
        let seeds = this.mesh.utils.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);
        this.looper.loop(seedIndices);

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, this.facePlotter.faces.length - 1);
        return randos.filter((r) => seedIndices.indexOf(r) < 0);
    }

    seed(payload) {
        // reset stopping flag
        this.stop = false;
        this.remaining = this.seedArtists(JSON.parse(payload));
        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    processOneArtist() {
        return this.looper.loopOnce(this.remaining);
    }

    oneArtist() {
        this.processOneArtist();

        // TODO: send back progress
        postMessage({
            type: 'faces.looped',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    batchOnce() {
        for (let j = 0; j <= ArtistManager.artistsRemaining(); j++) {
            if (this.processOneArtist()) {
                break;
            }
        }

        // TODO: send back progress
        postMessage({
            type: 'faces.batched',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    batch() {
        for (let i = 0; i < this.remaining.length; i++) {
            this.batchOnce();

            if (this.stop) {
                break;
            }
        }
    }
}

module.exports = Plotter;
