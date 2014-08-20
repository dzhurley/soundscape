define([
    'underscore',
    'helpers'
], function(_, h) {
    return function() {
        var last = {
            baseUrl: 'http://ws.audioscrobbler.com/2.0/?',

            defaultParams: {
                api_key: 'bd366f79f01332a48ae8ce061dba05a9',
                format: 'json',
                limit: '300',
                method: 'library.getartists',
                user: 'stutterbug42'
            },

            urlParams: function(params) {
                var newParams = _.extend({}, this.defaultParams, params);
                return _.map(_.keys(newParams), function(key) {
                    return _.map([key, newParams[key]], encodeURIComponent).join('=');
                }).join('&');
            },

            lastUrl: function(params) {
                return this.baseUrl + this.urlParams(params || {});
            },

            parseData: function(data) {
                var baseData =  _.map(data.artists.artist, function(artist) {
                    return {
                        name: artist.name,
                        playCount: parseInt(artist.playcount, 10)
                    };
                });
                return h.normalize(baseData, 'playCount', 'normCount');
            },

            getArtists: function() {
                if (!this.artists) {
                    this.artists = JSON.parse(localStorage.artists || null);
                }

                if (this.artists) {
                    App.vent.trigger('fetched.artists', this.artists);
                    return;
                }

                request = new XMLHttpRequest();
                request.open('GET', this.lastUrl(), true);

                request.onload = _.bind(function() {
                    if (request.status >= 200 && request.status < 400){
                        // Success!
                        data = JSON.parse(request.responseText);
                        this.artists = this.parseData(data);
                        App.vent.trigger('fetched.artists', this.artists);
                        localStorage.artists = JSON.stringify(this.artists);
                    }
                }, this);

                request.send();
            }
        };

        last.getArtists();
        return last;
    };
});
