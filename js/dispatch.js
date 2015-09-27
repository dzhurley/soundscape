'use strict';

/* Conduit for main and worker appwide events
 *
 * Validates against cataloged list of events
 *
 * TODO: needs to be able to manage multiple workers
 */

let EventEmitter = require('eventemitter2');
let events = require('./events');

class Dispatch extends EventEmitter {
    constructor(options = { wildcard: true }) {
        super(options);
    }

    bindToWorker(worker) {
        this.worker = worker;
        this.worker.onmessage = this.onWorkerMessage.bind(this);
        this.worker.onerror = this.onWorkerError.bind(this);
    }

    isValidEvent(event) {
        return events.indexOf(event) > -1;
    }

    emitOnWorker(event, data) {
        if (!this.isValidEvent(event)) return false;
        this.worker.postMessage({ type: event, payload: data });
    }

    onWorkerMessage(event) {
        if (!this.isValidEvent(event.data.type)) return false;

        this.emit(event.data.type, event.data.payload);
    }

    onWorkerError() {
        console.error('Worker Error:', arguments);
    }
}

module.exports = new Dispatch();
