const { lastfmToken } = require('constants');
const { emit } = require('dispatch');

const baseUrl = 'https://ws.audioscrobbler.com/2.0/';

const defaultParams = Object.freeze({
    'api_key': lastfmToken,
    'format': 'json',
    'method': 'library.getartists',
    // TODO: allow for better handling of paged responses
    'limit': 999
});

const paramsForUser = user => ({ user });

const parseData = (data = {}) => {
    if (data.error === 6) {
        emit('formError', 'not a user');
        return;
    }

    if (!data.artists.artist.length) {
        emit('formError', 'no artists for user');
        return;
    }

    // TODO: avoid lowercasing artists
    return data.artists.artist.map(artist => ({
        name: artist.name.toLowerCase(),
        playCount: Number.parseInt(artist.playcount, 10)
    }));
};

module.exports = { baseUrl, defaultParams, paramsForUser, parseData };
