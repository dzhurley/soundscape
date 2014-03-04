define([
    'underscore',
    'helpers',
    'three'
], function(_, h, THREE) {
    var nextArtistCallCount = 0;
    var artist;

    var stopSearching = function(totalArtists) {
        return totalArtists === nextArtistCallCount;
    };

    var nextArtist = function(artistIndex, data) {
        if (artistIndex === data.length) {
            artistIndex = 0;
        }
        artist = data[artistIndex];
        if (artist.faces === 0) {
            if (stopSearching(data.length)) {
                return false;
            }
            nextArtistCallCount++;
            return nextArtist(artistIndex + 1, data);
        }
        artist.faces--;
        nextArtistCallCount = 0;
        return {
            artist: artist,
            currentArtistIndex: artistIndex
        };
    };

    var setFace = function(face, totalArtists, artistIndex, artist) {
        face.color.setHex(h.spacedColor(totalArtists, artistIndex));
        face.color.multiplyScalar(artist.normCount);
        face.data = {
            name: artist.name,
            plays: artist.playCount
        };
    };

    var updateFaces = function(data) {
        var artistIndex = 0,
            faces = App.mesh.globe.geometry.faces,
            randos = h.randomBoundedArray(0, faces.length - 1);

        var totalPlays = _.reduce(data, function(memo, d) {
            return memo + d.playCount;
        }, 0);

        _.map(data, function(artist) {
            artist.faces = Math.floor(artist.playCount * faces.length / totalPlays);
            return artist;
        });

        for(var i in randos) {
            artistInfo = nextArtist(artistIndex, data);
            if (!artistInfo) {
                return;
            }
            artistIndex = artistInfo.currentArtistIndex;
            setFace(faces[randos[i]], data.length, artistIndex, artistInfo.artist);
        }
    };

    return {
        process: function(data) {
            updateFaces(data);
            App.mesh.update();
        }
    };
});
