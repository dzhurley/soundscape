// Connector between the form on screen and fetching data for a given user
//
// Caches responses in localStorage and manages set of possible sources for
// artist data. Once data is received, the seeding worker is kicked off with
// artist data. Each source must expose the following API:
//
// {
//     baseUrl: '',
//     defaultParams: {},
//     paramsForUser: function,
//     parseData: function
// }

const { emit, emitOnWorker, on } = require('dispatch');
const { packUrlParams, randomArray } = require('helpers');

let registered = {};

const registerSources = sources => {
    sources.map(src => registered[src] = require(`./${src}`));
};

// kick off app with valid artists
const trigger = artists => {
    emit('submitted');
    emitOnWorker('seed', artists);
};

const getArtists = (source, username) => {
    // check localStorage and use info if present
    if (Object.keys(localStorage).indexOf(username) > -1) {
        if (localStorage[username]) {
            trigger(localStorage[username]);
            return;
        }
    }

    // otherwise request from source
    const request = new XMLHttpRequest();
    const params = Object.assign({}, source.defaultParams, source.paramsForUser(username));
    request.open('GET', packUrlParams(source.baseUrl, params), true);

    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            const parsed = source.parseData(JSON.parse(request.responseText));
            if (!parsed) return;

            // randomize to avoid alphabetical globe seeding
            const artists = randomArray(parsed);
            // store for next time
            // TODO: expiry?
            localStorage[username] = JSON.stringify(artists);

            trigger(localStorage[username]);
        } else {
            console.error('invalid response', request.responseText);
        }
    };

    request.send();
};

// process form before submitting to source
const validate = username => {
    if (username.length === 0) {
        console.error('no username given');
        return;
    }
    // TODO: explore more sources
    getArtists(registered.lastfm, username);
};

on('submitting', validate);

module.exports = { registerSources };
