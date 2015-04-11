'use strict';

let ArtistManager = require('../artists');

class Looper {
    constructor(facePlotter) {
        this.facePlotter = facePlotter;
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

    runIteration(remaining) {
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
        faceInfo = this.facePlotter.nextFace(artist, rando);

        if (faceInfo.face) {
            remainingIndex = remaining.indexOf(faceInfo.index);
            if (remainingIndex > -1) {
                remaining.splice(remainingIndex, 1);
            }
            if (faceInfo.face !== true) {
                this.setNewFace(faceInfo.face, artist);
            }
        }
        return false;
    }

    loopOnce(remaining) {
        let startingLength = remaining.length;
        let iterationResult = this.runIteration(remaining);
        if (startingLength === remaining.length) {
            // no paints on this pass, no use trying again
            return true;
        }
        console.log('remaining', remaining.length);
        return iterationResult;
    }
}

module.exports = Looper;
