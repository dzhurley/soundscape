let THREE = require('three');

let h = require('../helpers');
let FacePlotter = require('./faces');
let ArtistManager = require('../artists');

class Looper {
    constructor(facePlotter, plotter) { 
        this.facePlotter = facePlotter;
        this.plotter = plotter;
        this.remaining = [];
    }

    setNewFace(face, artist) {
        // TODO: doesn't belong here
        face.color.set(artist.color);
        face.data.artist = artist.name;
        face.data.plays = artist.playCount;
        face.data.pending = true;
        artist.faces--;
    }

    runIteration(rando) {
        let artist;
        let faceInfo;
        let remainingIndex;

        // choose random face for each face to paint
        artist = ArtistManager.nextArtist();
        if (!artist) {
            // no more faces left for any artist to paint
            return true;
        }
        faceInfo = this.facePlotter.nextFace(artist, rando);

        if (faceInfo.face) {
            remainingIndex = this.remaining.indexOf(faceInfo.index);
            if (remainingIndex > -1) {
                this.remaining.splice(remainingIndex, 1);
            }
            if (faceInfo.face !== true) {
                this.setNewFace(faceInfo.face, artist);
            }
        }
        return false;
    }

    // TODO: merge with loopOnce, only used to seed
    loop(randos) {
        this.remaining = Array.from(randos);
        let currentPass;

        while (this.remaining.length) {
            currentPass = Array.from(this.remaining);

            for (let i in currentPass) {
                if (this.runIteration(currentPass[i])) {
                    // we're done with all the faces
                    return;
                }
            }

            if (currentPass.length === this.remaining.length) {
                // nothing got painted on this pass, so bail
                return;
            }
        }
    }

    loopOnce(remaining) {
        let startingLength = remaining.length;
        this.remaining = remaining;
        let iterationResult = this.runIteration(this.remaining[0]);
        if (startingLength === this.remaining.length) {
            // no paints on this pass, no use trying again
            this.plotter.stop = true;
        }
        console.log('remaining', this.remaining.length);
        return iterationResult;
    }
}

module.exports = Looper;
