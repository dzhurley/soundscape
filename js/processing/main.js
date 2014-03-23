define([
    'underscore',
    'helpers',
    'threejs',
    './artists',
    './faces'
], function(_, h, THREE, ArtistProcessor, FaceProcessor) {
    return function() {
        var paintedFaces = [];
        var facer = new FaceProcessor();
        var artister = new ArtistProcessor();

        var processor = {
            facer: facer,
            artister: artister,

            setFace: function(face, artist) {
                if (!face) {
                    return;
                }
                // paint face with artist color and info
                face.color.setHex(h.spacedColor(artister.totalArtists, artister.artistIndex));
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
                artist = artister.nextArtist();
                if (!artist) {
                    // no more faces left for any artist to paint
                    return false;
                }
                faceInfo = facer.nextFace(artist, rando);
                paintedFaces.push(facer.faces.indexOf(faceInfo.face));
                this.setFace(faceInfo.face, artist);

                if (faceInfo.retry) {
                    return processor.runLoop(rando);
                }
            },

            process: function(evt, data) {
                this.artister.setData(data);
                this.randos = h.randomBoundedArray(0, this.facer.faces.length - 1);

                var totalPlays = _.reduce(data, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(facer.faces, function(face) {
                    face.data = {};
                });

                _.map(data, function(artist) {
                    // faces available for a given artist to paint
                    artist.faces = Math.round(artist.playCount * facer.faces.length / totalPlays);
                    return artist;
                });

                for(var i in this.randos) {
                    this.runLoop(this.randos[i]);
                }

                App.three.mesh.update();
            }
        };

        App.vent.on('fetched.artists', _.bind(processor.process, processor));

        return processor;
    };
});
