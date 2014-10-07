define([
    'sources/last'
], function(Last) {
    var sourcer = function() {
        return {
            sources: {
                last: Last
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
                App.vent.trigger('starting.source', src);
                src.getArtistsForUser(username);
            }
        };
    };
    return sourcer;
});