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
        if (artistIndex === totalArtists) {
            artistIndex = 0;
        }
        artist = data[artistIndex];
        if (artist.faces === 0) {
            if (nextArtistCallCount === totalArtists) {
                return false;
            }
            nextArtistCallCount++;
            return nextArtist(artistIndex + 1, data);
        }
        artist.faces--;
        artistIndex++;
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
        face.color.setHex(h.spacedColor(totalArtists, artistIndex));
        face.color.multiplyScalar(artist.normCount);
        face.data = {
            name: artist.name,
            plays: artist.playCount
        };
    };

    var updateFaces = function(data) {
        var artistIndex = 0,
            randos = h.randomBoundedArray(0, faces.length - 1);

        var totalPlays = _.reduce(data, function(memo, d) {
            return memo + d.playCount;
        }, 0);

        _.map(data, function(artist) {
            artist.faces = Math.round(artist.playCount * faces.length / totalPlays);
            return artist;
        });

        for(var i in randos) {
            artistInfo = nextArtist(artistIndex, data);
            if (!artistInfo) {
                return;
            }
            artistIndex = artistInfo.currentArtistIndex;
            faceToSet = nextFace(artist, randos[i]);
            setFace(faceToSet, artistIndex, artistInfo.artist);
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
