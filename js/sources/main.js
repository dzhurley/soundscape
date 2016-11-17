/* Connector between the form on screen and fetching data for a given user
 *
 * Caches responses in localStorage and manages set of possible sources for
 * artist data. Once data is received, the plotting worker is kicked off
 * with the dataset.
 *
 * Each source must expose the following API:
 *
 *     {
 *         baseUrl: '',
 *         defaultParams: {},
 *         paramsForUser: fn,
 *         parseData: fn
 *     }
 */

const { setArtists } = require('artists');
const { packUrlParams, randomArray } = require('helpers');
const { emit, on } = require('dispatch');
const nodes = require('seeding/nodes');

// TODO: find better state solution (localStorage?)
let registered = {};

const registerSources = sources => sources.map(src => registered[src] = require(`./${src}`));

const getArtists = (source, username) => {
    if (Object.keys(localStorage).indexOf(username) > -1) {
        const data = JSON.parse(localStorage[username]);

        if (data) {
            emit('submitted');
            nodes.create(setArtists(data));
            return;
        }
    }

    const request = new XMLHttpRequest();
    const params = Object.assign({}, source.defaultParams, source.paramsForUser(username));
    request.open('GET', packUrlParams(source.baseUrl, params), true);

    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            const artists = randomArray(source.parseData(JSON.parse(request.responseText)));
            const stringified = JSON.stringify(artists);
            localStorage[username] = stringified;
            emit('submitted');
            nodes.create(setArtists(artists));
        }
    };

    request.send();
};

const checkSource = (source, username) => {
    // TODO: be nicer
    if (!Object.keys(registered).indexOf(source) < 0) {
        console.error(`Invalid source: ${source}`);
        return;
    }
    if (username.length === 0) {
        console.error('No username given');
        return;
    }
    getArtists(registered[source], username);
};

on('submitting', checkSource);

module.exports = { registerSources };
