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
                method: 'library.getartists'
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
                if (data.error && data.error == 6) {
                    // TODO: find a nicer way
                    alert('not a user');
                    return;
                }
                var baseData =  _.map(data.artists.artist, function(artist) {
                    return {
                        name: artist.name,
                        playCount: parseInt(artist.playcount, 10)
                    };
                });
                return h.normalize(baseData, 'playCount', 'normCount');
            },

            getArtistsForUser: function(username) {
                if (!this.artists) {
                    if (_.contains(_.keys(localStorage), username)) {
                        this.artists = JSON.parse(localStorage[username]);
                    }
                }

                if (this.artists) {
                    App.plotter.worker.postMessage({
                        msg: 'seed',
                        artists: JSON.stringify(this.artists)
                    });
                    return;
                }

                request = new XMLHttpRequest();
                request.open('GET', this.lastUrl({user: username}), true);

                request.onload = _.bind(function() {
                    if (request.status >= 200 && request.status < 400){
                        // Success!
                        var data = JSON.parse(request.responseText);
                        this.artists = this.parseData(data);
                        var stringified = JSON.stringify(this.artists);
                        App.plotter.worker.postMessage({
                            msg: 'seed',
                            artists: stringified
                        });
                        localStorage[username] = stringified;
                    }
                }, this);

                request.send();
            }
        };

        return last;
    };
});
