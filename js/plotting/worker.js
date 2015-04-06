let Dispatch = require('../dispatch');
let ArtistManager = require('../artists');
let Seeder = require('./seeder');

class Plotter {
    constructor(mesh) {
        this.mesh = mesh;
        this.seeder = new Seeder(mesh);

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

    seed(payload) {
        // reset stopping flag
        this.seeder.stop = false;
        this.remaining = this.seeder.seed(JSON.parse(payload));
        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: {
                faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
            }
        });
    }

    processOneArtist() {
        return this.seeder.looper.loopOnce(this.remaining);
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

            if (this.seeder.stop) {
                break;
            }
        }
    }
}

module.exports = Plotter;
