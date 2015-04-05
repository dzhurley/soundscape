let _ = require('underscore');
let h = require('../helpers');
let Dispatch = require('../dispatch');
let Last = require('./last');

class Sourcer {
    constructor(sources = {}) {
        this.sources = sources;
    }

    sourceUrl(params = {}) {
        let params = Object.assign({}, this.activeSource.defaultParams, params);
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
        let src = this.sources[source];

        if (_.isFunction(src)) src = new src(); 

        this.activeSource = src;
        this.getArtistsForUser(username);

        Dispatch.emit('submitted');
        this.artists = null;
    }

    getArtistsForUser(username) {
        if (Object.keys(localStorage).indexOf(username) > -1) {
            this.artists = JSON.parse(localStorage[username]);

            if (this.artists) {
                Dispatch.emitOnWorker('plot.seed', JSON.stringify(this.artists));
                return;
            }
        }

        let url = this.sourceUrl(this.activeSource.paramsForUser(username));
        let request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400){
                let data = JSON.parse(request.responseText);
                this.artists = this.activeSource.parseData(data);
                let stringified = JSON.stringify(_.shuffle(this.artists));
                Dispatch.emitOnWorker('plot.seed', stringified);
                localStorage[username] = stringified;
            }
        };

        request.send();
    }
};

module.exports = new Sourcer({last: Last});
