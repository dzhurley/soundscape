var _ = require('underscore');
var h = require('../helpers');

var last = {
    baseUrl: 'http://ws.audioscrobbler.com/2.0/',

    defaultParams: {
        api_key: 'bd366f79f01332a48ae8ce061dba05a9',
        format: 'json',
        method: 'library.getartists',
        // TODO: allow for better handling of paged responses
        limit: 999
    },

    paramsForUser: function(username) {
        return { user: username };
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
    }
};

module.exports = last;
