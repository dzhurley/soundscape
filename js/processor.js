define([
    'underscore',
    'three'
], function(_, THREE) {
    var normalize = function(data) {
        var counts = _.map(data, function(artist) {
            return parseInt(artist.playCount, 10);
        });

        var max = Math.max.apply(this, counts),
            min = Math.min.apply(this, counts),
            denom = max - min;

        _.each(data, function(artist) {
            artist.normCount = (artist.playCount - min) / denom;
        });
    };

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
            faces[i].color.setHex(0x00ff00);
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
            normalize(data);
            updateFaces(data);
            App.mesh.update();
        }
    };
});
