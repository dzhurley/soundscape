define([
    'underscore',
    'helpers',
    'three'
], function(_, h, THREE) {
    var artist;
    var artistInfo;
    var face;
    var faces;
    var facesToSet;
    var nextArtistCallCount = 0;
    var totalArtists;

    var nextArtist = function(artistIndex, data) {
        // rollover to beginning of artists
        if (artistIndex === totalArtists) {
            artistIndex = 0;
        }
        artist = data[artistIndex];
        if (artist.faces === 0) {
            if (nextArtistCallCount === totalArtists) {
                // when we've recursed to confirm every `artist.faces` is 0,
                // we are done painting and return
                return false;
            }
            // if there aren't any faces left to paint for this artist, check
            // the next artist and record how far we've recursed
            nextArtistCallCount++;
            return nextArtist(artistIndex + 1, data);
        }
        // log that this artist painted a face
        artist.faces--;
        // set up next call for next artist
        artistIndex++;
        // reset recursive logging
        nextArtistCallCount = 0;
        return {
            artist: artist,
            currentArtistIndex: artistIndex
        };
    };

    var nextFace = function(artist, faceNum) {
        face = faces[faceNum];
        return face;
    };

    var setFace = function(face, artistIndex, artist) {
        // paint face with artist color and info
        face.color.setHex(h.spacedColor(totalArtists, artistIndex));
        face.color.multiplyScalar(artist.normCount);
        face.data = {
            name: artist.name,
            plays: artist.playCount
        };
        App.mesh.update();
    };

    var updateFaces = function(data) {
        var artistIndex = 0,
            randos = h.randomBoundedArray(0, faces.length - 1);

        var totalPlays = _.reduce(data, function(memo, d) {
            return memo + d.playCount;
        }, 0);

        _.map(data, function(artist) {
            // faces available for a given artist to paint
            artist.faces = Math.round(artist.playCount * faces.length / totalPlays);
            return artist;
        });

        function loopLogic(i) {
            // choose random face for each face to paint
            artistInfo = nextArtist(artistIndex, data);
            if (!artistInfo) {
                // no more faces left for any artist to paint
                return;
            }
            artistIndex = artistInfo.currentArtistIndex;
            faceToSet = nextFace(artist, randos[i]);
            setFace(faceToSet, artistIndex, artistInfo.artist);
        }

        if (App.watchItPaint) {
            (function myLoop (i) {
                // watch it paint each face
                loopLogic(i);
                setTimeout(function () {
                    if (--i) myLoop(i);
                }, 0);
            })(randos.length - 1);
        } else {
            for(var i in randos) {
                loopLogic(i);
            }
        }
    };

    return {
        process: function(data) {
            faces = App.mesh.globe.geometry.faces;
            totalArtists = data.length;
            updateFaces(data);
            App.mesh.update();
        }
    };
});
