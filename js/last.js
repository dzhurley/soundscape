define([
    'underscore',
    'three',
    'processor'
], function(_, THREE, processor) {
    var lastUrl = 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=bd366f79f01332a48ae8ce061dba05a9&user=stutterbug42&format=json&limit=300';

    var parseData = function(data) {
        return _.map(data.artists.artist, function(artist) {
            return {
                name: artist.name,
                playCount: parseInt(artist.playcount, 10)
            };
        });
    };

    return {
        getArtists: function() {
            if (!this.artists) {
                this.artists = localStorage['artists'] && JSON.parse(localStorage['artists']);
            }

            if (this.artists) {
                processor.process(this.artists);
                return;
            }

            $.getJSON(lastUrl, _.bind(function(data) {
                this.artists = parseData(data);
                processor.process(this.artists);
                localStorage['artists'] = JSON.stringify(this.artists);
            }, this));
        }
    };
});
