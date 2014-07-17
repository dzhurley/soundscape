define([
    'underscore',
    'helpers',
    'threejs',
    './artists',
    './faces'
], function(_, h, THREE, ArtistProcessor, FaceProcessor) {
    return function(facer, artister) {
        var looper = {
            facer: facer,
            artister: artister,
            remaining: [],

            setFace: function(face, artist) {
                // paint face with artist color and info
                index = this.artister.artists.indexOf(artist);
                face.color.setHex(h.spacedColor(this.artister.artists.length, artist.rank));
                face.color.multiplyScalar(artist.normCount);
                face.data.artist = artist.name;
                face.data.plays = artist.playCount;
                artist.faces--;
                App.vent.trigger('painted.face', face);
                App.three.mesh.update();
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
                faceInfo = this.facer.nextFace(artist, rando);

                if (faceInfo.face) {
                    remainingIndex = this.remaining.indexOf(faceInfo.index);
                    if (remainingIndex > -1) {
                        this.remaining.splice(remainingIndex, 1);
                    }
                    this.setFace(faceInfo.face, artist);
                }
                return false;
            },

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

            loopOnce: function(faces, continueOnSwap) {
                if (continueOnSwap) {
                    App.stopOnSwap = false;
                }
                this.remaining = App.remaining;
                var iterationResult = this.runIteration(faces && faces[0]);
                console.log('remaining', App.remaining.length);
                return iterationResult;
            }
        };

        return looper;
    };
});
