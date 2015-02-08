define([
    'underscore',
    'helpers',
    'threejs',
    'plotting/artists',
    'plotting/faces'
], function(_, h, THREE, ArtistPlotter, FacePlotter) {
    return function(facePlotter, artister, plotter) {
        var looper = {
            facePlotter: facePlotter,
            artister: artister,
            plotter: plotter,
            remaining: [],

            setNewFace: function(face, artist) {
                // TODO: doesn't belong here
                // paint face with artist color and info
                index = this.artister.artists.indexOf(artist);
                face.color.setHex(h.spacedColor(this.artister.artists.length, artist.rank));
                face.color.multiplyScalar(artist.normCount);
                face.data.artist = artist.name;
                face.data.plays = artist.playCount;
                face.data.pending = true;
                artist.faces--;
            },

            runIteration: function(rando) {
                var artist;
                var faceInfo;
                var remainingIndex;

                // choose random face for each face to paint
                artist = this.artister.nextArtist();
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
            },

            // TODO: merge with loopOnce, only used to seed
            loop: function(randos) {
                this.remaining = randos;
                var currentPass;
                var i = 0;

                while (this.remaining.length) {
                    currentPass = _.clone(this.remaining);

                    for (i in currentPass) {
                        if (this.runIteration(currentPass[i])) {
                            // we're done with all the faces
                            return;
                        }
                    }
                    i = 0;

                    if (currentPass.length === this.remaining.length) {
                        // nothing got painted on this pass, so bail
                        return;
                    }
                }
            },

            loopOnce: function(remaining) {
                var startingLength = remaining.length;
                this.remaining = remaining;
                var iterationResult = this.runIteration(this.remaining[0]);
                if (startingLength === this.remaining.length) {
                    // no paints on this pass, no use trying again
                    this.plotter.stop = true;
                }
                console.log('remaining', this.remaining.length);
                return iterationResult;
            }
        };

        return looper;
    };
});
