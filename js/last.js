define([
    'underscore',
    'helpers'
], function(_, h) {
    return function() {
        var parseData = function(data) {
            var baseData =  _.map(data.artists.artist, function(artist) {
                return {
                    name: artist.name,
                    playCount: parseInt(artist.playcount, 10)
                };
            });
            return h.normalize(baseData, 'playCount', 'normCount');
        };

        var last = {
            lastUrl: 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=bd366f79f01332a48ae8ce061dba05a9&user=stutterbug42&format=json&limit=300',

            getArtists: function() {
                if (!this.artists) {
                    this.artists = JSON.parse(localStorage.artists || null);
                }

                if (this.artists) {
                    App.vent.trigger('fetched.artists', this.artists);
                    return;
                }

                $.getJSON(this.lastUrl, _.bind(function(data) {
                    this.artists = parseData(data);
                    App.vent.trigger('fetched.artists', this.artists);
                    localStorage.artists = JSON.stringify(this.artists);
                }, this));
            }
        };

        last.getArtists();
        return last;
    };
});
