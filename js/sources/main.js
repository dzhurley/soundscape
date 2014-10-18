define([
    'helpers',
    'sources/last'
], function(h, Last) {
    var sourcer = function() {
        return {
            sources: {
                last: Last
            },

            sourceUrl: function(params) {
                params = _.extend({}, this.activeSource.defaultParams, params || {});
                return this.activeSource.baseUrl + '?' + h.packUrlParams(params);
            },

            checkSource: function(evt) {
                evt.preventDefault();
                var source = evt.target.querySelector('#source').value;
                var username = evt.target.querySelector('#username').value;

                if (!_.contains(_.keys(this.sources), source)) {
                    console.error('Invalid source: ' + source);
                    return false;
                }
                if (username.length === 0) {
                    console.error('No username given');
                    return false;
                }

                evt.target.querySelector('#username').value = '';
                App.sourcesButton.click();
                this.startSource(source, username);
                return false;
            },

            startSource: function(source, username) {
                var src = this.sources[source];
                if (_.isFunction(src)) {
                    src = new src();
                }
                this.activeSource = src;
                App.vent.trigger('starting.source', src);
                this.getArtistsForUser(username);
            },

            getArtistsForUser: function(username) {
                if (!this.artists) {
                    if (_.contains(_.keys(localStorage), username)) {
                        this.artists = JSON.parse(localStorage[username]);

                        if (this.artists) {
                            App.plotter.worker.postMessage({
                                msg: 'seed',
                                artists: JSON.stringify(this.artists)
                            });
                            return;
                        }
                    }
                }

                var url = this.sourceUrl(this.activeSource.paramsForUser(username));
                request = new XMLHttpRequest();
                request.open('GET', url, true);

                request.onload = _.bind(function() {
                    if (request.status >= 200 && request.status < 400){
                        // Success!
                        var data = JSON.parse(request.responseText);
                        this.artists = this.activeSource.parseData(data);
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
    };
    return sourcer;
});
