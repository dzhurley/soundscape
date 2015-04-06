let THREE = require('three');

let h = require('../helpers');
let FacePlotter = require('./faces');
let Looper = require('./looper');
let ArtistManager = require('../artists');

class Seeder {
    constructor(mesh) {
        this.meshUtils = mesh.utils;
        this.facePlotter = new FacePlotter(mesh);
        this.looper = new Looper(this.facePlotter, this);
    }

    seed(data) {
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
        let seeds = this.meshUtils.findEquidistantFaces(ArtistManager.artists.length);
        let seedIndices = seeds.map((seed) => seed.faceIndex);
        this.looper.loop(seedIndices);

        // set remaining faces to paint
        let randos = h.randomBoundedArray(0, this.facePlotter.faces.length - 1);
        return randos.filter((r) => seedIndices.indexOf(r) < 0);
    }
}

module.exports = Seeder;
