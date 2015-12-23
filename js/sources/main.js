'use strict';

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

const h = require('../helpers');
const { emit, emitOnWorker, on } = require('../dispatch');

class Sourcer {
    constructor() {
        this.sources = {};
        on('submitting', this.checkSource.bind(this));
    }

    addSources(sources) {
        for (let src of sources) {
            this.sources[src] = require(`./${src}`);
        }
    }

    sourceUrl(params = {}) {
        params = Object.assign({}, this.activeSource.defaultParams, params);
        return h.packUrlParams(this.activeSource.baseUrl, params);
    }

    checkSource(evt) {
        evt.preventDefault();
        let source = evt.target.querySelector('#source').value;
        let username = evt.target.querySelector('#username').value;

        // TODO be nicer
        if (!Object.keys(this.sources).indexOf(source) < 0) {
            console.error(`Invalid source: ${source}`);
            return false;
        }
        if (username.length === 0) {
            console.error('No username given');
            return false;
        }

        this.startSource(source, username);
        return false;
    }

    startSource(source, username) {
        this.activeSource = this.sources[source];
        this.getArtistsForUser(username);

        emit('submitted');
        this.artists = null;
    }

    getArtistsForUser(username) {
        if (Object.keys(localStorage).indexOf(username) > -1) {
            this.artists = JSON.parse(localStorage[username]);

            if (this.artists) {
                emitOnWorker('plot.seed', JSON.stringify(this.artists));
                return;
            }
        }

        let url = this.sourceUrl(this.activeSource.paramsForUser(username));
        let request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.responseText);
                this.artists = this.activeSource.parseData(data);
                let stringified = JSON.stringify(h.randomArray(this.artists));
                emitOnWorker('plot.seed', stringified);
                localStorage[username] = stringified;
            }
        };

        request.send();
    }
}

module.exports = new Sourcer;
