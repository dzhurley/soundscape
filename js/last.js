define([
    'underscore',
    'three'
], function(_, THREE) {
    var lastUrl = 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=bd366f79f01332a48ae8ce061dba05a9&user=stutterbug42&format=json&limit=300';

    var parseData = function(data) {
        return _.map(data.artists.artist, function(artist) {
            return {
                name: artist.name,
                playCount: artist.playcount
            };
        });
    };

    var updateFaces = function(artists) {
        var faces = App.mesh.globe.geometry.faces;
        for(var i in faces) {
            // earth: #3C9251, ocean: #6370FD
            faces[i].color.setHex(_.sample([0x3C9251, 0x6370FD]));
        }
    };

    return {
        getArtists: function() {
            $.getJSON(lastUrl, _.bind(function(data) {
                this.artists = parseData(data);
                updateFaces(this.artists);
                App.mesh.update();
            }, this));
        }
    };
});
