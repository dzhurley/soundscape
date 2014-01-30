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

    return {
        getArtists: function() {
            $.getJSON(lastUrl, _.bind(function(data) {
                this.artists = parseData(data);
            }, this));
        }
    };
});
