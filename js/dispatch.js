let EventEmitter = require('eventemitter2').EventEmitter2;

class Dispatch extends EventEmitter {
    constructor(options = { wildcard: true }) {
        super(options);
    }

    bindToWorker(worker) {
        this._worker = worker;
        this._worker.onmessage = this.onWorkerMessage.bind(this);
        this._worker.onerror = this.onWorkerError.bind(this);
    }

    emitOnWorker(event, data) {
        this._worker.postMessage({ type: event, payload: data });
    }

    onWorkerMessage(event) {
        this.emit(event.data.type, event.data.payload);
    }

    onWorkerError(event) {
        console.error('Worker Error:', arguments);
    }
}

module.exports = new Dispatch();
