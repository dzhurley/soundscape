define([
    'underscore',
    'helpers',
    'three',
    'processor'
], function(_, h, THREE, processor) {
    var lastUrl = 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=bd366f79f01332a48ae8ce061dba05a9&user=stutterbug42&format=json&limit=300';

    var parseData = function(data) {
        var baseData =  _.map(data.artists.artist, function(artist) {
            return {
                name: artist.name,
                playCount: parseInt(artist.playcount, 10)
            };
        });
        return h.normalize(baseData, 'playCount', 'normCount');
    };

    return {
        getArtists: function() {
            if (!this.artists) {
                this.artists = JSON.parse(localStorage.artists || null);
            }

            if (this.artists) {
                processor.process(this.artists);
                return;
            }

            $.getJSON(lastUrl, _.bind(function(data) {
                this.artists = parseData(data);
                processor.process(this.artists);
                localStorage.artists = JSON.stringify(this.artists);
            }, this));
        }
    };
});
