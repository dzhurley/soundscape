define([
    'underscore',
    'helpers',
    'three'
], function(_, h, THREE) {
    var facesPerArtist = function(artist, faces, total) {
        return Math.floor(artist.playCount * faces.length / total);
    };

    var updateFaces = function(data) {
        var artistIndex = 0,
            artist = data[artistIndex],
            faces = App.mesh.globe.geometry.faces;
        var totalPlays = _.reduce(data, function(memo, d) {
            return memo + d.playCount;
        }, 0);

        var facesPer = facesPerArtist(artist, faces, totalPlays);

        for(var i in faces) {
            if (i == facesPer) {
                if (++artistIndex >= data.length) {
                    return;
                }
                artist = data[artistIndex];
                facesPer += facesPerArtist(artist, faces, totalPlays);
            }
            faces[i].color.setHex(h.spacedColor(data.length, artistIndex));
            faces[i].color.multiplyScalar(artist.normCount);
            faces[i].data = {
                name: artist.name,
                plays: artist.playCount,
                number: i
            };
        }
    };

    return {
        process: function(data) {
            updateFaces(data);
            App.mesh.update();
        }
    };
});
