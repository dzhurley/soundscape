'use strict';

let EventEmitter = require('eventemitter2').EventEmitter2;

class Dispatch extends EventEmitter {
    constructor(options = { wildcard: true }) {
        super(options);
    }

    bindToWorker(worker) {
        this.worker = worker;
        this.worker.onmessage = this.onWorkerMessage.bind(this);
        this.worker.onerror = this.onWorkerError.bind(this);
    }

    emitOnWorker(event, data) {
        this.worker.postMessage({ type: event, payload: data });
    }

    onWorkerMessage(event) {
        this.emit(event.data.type, event.data.payload);
    }

    onWorkerError() {
        console.error('Worker Error:', arguments);
    }
}

module.exports = new Dispatch();
