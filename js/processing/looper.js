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
                index = index || this.artister.artistIndex;
                if (!face) {
                    return;
                }
                // paint face with artist color and info
                face.color.setHex(h.spacedColor(this.artister.artists.length, index));
                face.color.multiplyScalar(artist.normCount);
                face.data.plays = artist.playCount;
                artist.faces--;
            },

            runIteration: function(rando) {
                var artist;
                var faceInfo;
                var remainingIndex;

                if (!_.contains(this.remaining, rando)) {
                    return false;
                }

                // choose random face for each face to paint
                artist = this.artister.nextArtist();
                if (!artist) {
                    // no more faces left for any artist to paint
                    App.three.mesh.update();
                    return true;
                }
                faceInfo = this.facer.nextFace(artist, rando);
                remainingIndex = this.remaining.indexOf(faceInfo.index);
                if (remainingIndex > -1) {
                    this.remaining.splice(remainingIndex, 1);
                }
                this.setFace(faceInfo.face, artist);

                if (faceInfo.retry) {
                    // this face at this index is still blank, so try again
                    return looper.runIteration(rando);
                }
            },

            loop: function(randos) {
                this.remaining = randos;
                var i = 0;

                while (this.remaining.length) {
                    var start = this.remaining.length;
                    var done;

                    for (i in this.remaining) {
                        if (this.runIteration(this.remaining[i])) {
                            // we're done with all the faces
                            debugger;
                            return;
                        }
                    }
                    i = 0;

                    if (start === this.remaining.length) {
                        // nothing got painted on this pass, so bail
                        return;
                    }
                }
            }
        };

        return looper;
    };
});
