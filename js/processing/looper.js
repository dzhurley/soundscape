define([
    'underscore',
    'helpers',
    'threejs',
    './artists',
    './faces'
], function(_, h, THREE, ArtistProcessor, FaceProcessor) {
    return function() {
        var looper = {
            init: function(facer, artister) {
                this.facer = facer;
                this.artister = artister;
                this.remaining = [];
            },

            setFace: function(face, artist, index) {
                // paint face with artist color and info
                if (index) {
                    this.artister.artistIndex = index;
                }
                if (artist.faces === 0) {
                    debugger;
                }
                face.color.setHex(h.spacedColor(this.artister.artists.length,
                                                this.artister.artistIndex));
                face.color.multiplyScalar(artist.normCount);
                face.data.artist = artist.name;
                face.data.plays = artist.playCount;
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
                    App.three.mesh.update();
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
            }
        };

        return looper;
    };
});
