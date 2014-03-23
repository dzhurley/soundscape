define([
    'underscore',
    'helpers',
    'threejs',
    './artists',
    './faces'
], function(_, h, THREE, ArtistProcessor, FaceProcessor) {
    return function() {
        var paintedFaces = [];

        var looper = {
            setRefs: function(facer, artister) {
                this.facer = facer;
                this.artister = artister;
            },

            setFace: function(face, artist) {
                if (!face) {
                    return;
                }
                // paint face with artist color and info
                face.color.setHex(h.spacedColor(this.artister.totalArtists,
                                                this.artister.artistIndex));
                face.color.multiplyScalar(artist.normCount);
                face.data.plays = artist.playCount;
                App.three.mesh.update();
            },

            runLoop: function(rando) {
                var artist;
                var faceInfo;

                if (_.contains(paintedFaces, rando)) {
                    return false;
                }
                // choose random face for each face to paint
                artist = this.artister.nextArtist();
                if (!artist) {
                    // no more faces left for any artist to paint
                    return false;
                }
                faceInfo = this.facer.nextFace(artist, rando);
                paintedFaces.push(this.facer.faces.indexOf(faceInfo.face));
                this.setFace(faceInfo.face, artist);

                if (faceInfo.retry) {
                    return looper.runLoop(rando);
                }
            }
        };

        // events for retries
        return looper;
    };
});
