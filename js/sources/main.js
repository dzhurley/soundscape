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

const { packUrlParams, randomArray } = require('helpers');
const { emit, emitOnWorker, on } = require('dispatch');
const { isActive } = require('labs');

const { forceSeed } = require('plotting/seeder');

// TODO: find better state solution (localStorage?)
let registered = {};

const registerSources = sources => sources.map(src => registered[src] = require(`./${src}`));

const seed = d => isActive('forceSeeding') ? forceSeed(d) : emitOnWorker('plot.seed', d);

const getArtists = (source, username) => {
    if (Object.keys(localStorage).indexOf(username) > -1) {
        let data = localStorage[username];

        if (data) {
            emit('submitted');
            seed(data);
            return;
        }
    }

    let request = new XMLHttpRequest();
    let params = Object.assign({}, source.defaultParams, source.paramsForUser(username));
    request.open('GET', packUrlParams(source.baseUrl, params), true);

    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            let artists = source.parseData(JSON.parse(request.responseText));
            let stringified = JSON.stringify(randomArray(artists));
            localStorage[username] = stringified;
            emit('submitted');
            seed(stringified);
        }
    };

    request.send();
};

const checkSource = evt => {
    evt.preventDefault();
    let source = evt.target.querySelector('#source').value;
    let username = evt.target.querySelector('#username').value;

    // TODO: be nicer
    if (!Object.keys(registered).indexOf(source) < 0) {
        console.error(`Invalid source: ${source}`);
        return false;
    }
    if (username.length === 0) {
        console.error('No username given');
        return false;
    }

    getArtists(registered[source], username);
    return false;
};

on('submitting', checkSource);

module.exports = { registerSources };
