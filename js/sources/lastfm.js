'use strict';

/* Last.fm specific source */

const { normalize } = require('../helpers');

module.exports = {
    baseUrl: 'http://ws.audioscrobbler.com/2.0/',

    defaultParams: {
        'api_key': 'bd366f79f01332a48ae8ce061dba05a9',
        'format': 'json',
        'method': 'library.getartists',
        // TODO: allow for better handling of paged responses
        'limit': 999
    },

    paramsForUser(username) {
        return { user: username };
    },

    parseData(data = {}) {
        if (data.error === 6) {
            // TODO: find a nicer way
            console.error('not a user');
            return {};
        }

        return normalize(data.artists.artist.map(artist => ({
            name: artist.name,
            playCount: Number.parseInt(artist.playcount, 10)
        })), 'playCount', 'normCount');
    }
};
