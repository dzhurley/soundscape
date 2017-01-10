const baseUrl = 'https://ws.audioscrobbler.com/2.0/';

const defaultParams = Object.freeze({
    'api_key': 'bd366f79f01332a48ae8ce061dba05a9',
    'format': 'json',
    'method': 'library.getartists',
    // TODO: allow for better handling of paged responses
    'limit': 999
});

const paramsForUser = user => ({ user });

const parseData = (data = {}) => {
    if (data.error === 6) {
        // TODO: find a nicer way
        console.error('not a user');
        return;
    }

    if (!data.artists.artist.length) {
        // TODO: find a nicer way
        console.error('no artists scrobbled for user');
        return;
    }

    // TODO: avoid lowercasing artists
    return data.artists.artist.map(artist => ({
        name: artist.name.toLowerCase(),
        playCount: Number.parseInt(artist.playcount, 10)
    }));
};

module.exports = { baseUrl, defaultParams, paramsForUser, parseData };
