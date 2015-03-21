var _ = require('underscore');
var h = require('../helpers');
var Dispatch = require('../dispatch');
var Last = require('./last');

var sourcer = {
    sources: {
        last: Last
    },

    sourceUrl: function(params) {
        params = _.extend({}, this.activeSource.defaultParams, params || {});
        return h.packUrlParams(this.activeSource.baseUrl, params);
    },

    checkSource: function(evt) {
        evt.preventDefault();
        var source = evt.target.querySelector('#source').value;
        var username = evt.target.querySelector('#username').value;

        if (!_.contains(_.keys(this.sources), source)) {
            console.error(`Invalid source: ${source}`);
            return false;
        }
        if (username.length === 0) {
            console.error('No username given');
            return false;
        }

        this.startSource(source, username);
        return false;
    },

    startSource: function(source, username) {
        var src = this.sources[source];
        if (_.isFunction(src)) {
            src = new src();
        }

        this.activeSource = src;
        this.getArtistsForUser(username);

        Dispatch.emit('submitted');
        this.artists = null;
    },

    getArtistsForUser: function(username) {
        if (_.contains(_.keys(localStorage), username)) {
            this.artists = JSON.parse(localStorage[username]);

            if (this.artists) {
                Dispatch.emitOnWorker('plot.seed', JSON.stringify(this.artists));
                return;
            }
        }

        var url = this.sourceUrl(this.activeSource.paramsForUser(username));
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400){
                // Success!
                var data = JSON.parse(request.responseText);
                this.artists = this.activeSource.parseData(data);
                var stringified = JSON.stringify(_.shuffle(this.artists));
                Dispatch.emitOnWorker('plot.seed', stringified);
                localStorage[username] = stringified;
            }
        }.bind(this);

        request.send();
    }
};

module.exports = sourcer;
