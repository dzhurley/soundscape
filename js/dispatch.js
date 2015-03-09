var _ = require('underscore');
var EventEmitter = require('eventemitter2').EventEmitter2;

var dispatch = {
    init: function() {
        this.bus = new EventEmitter({ wildcard: true });

        this.worker = new Worker('js/worker.js');
        this.worker.onmessage = this.onWorkerMessage.bind(this);
        this.worker.onerror = this.onWorkerError.bind(this);
    },

    emitOnWorker: function(event, data) {
        this.worker.postMessage({
            type: event,
            payload: data
        });
    },

    onWorkerMessage: function(event) {
        this.bus.emit(event.data.type, event.data.payload);
    },

    onWorkerError: function(event) {
        console.error('Worker Error:', arguments);
    },

    emit: function(event, data) {
        this.bus.emit(event, data);
    },

    on: function(event, callback) {
        this.bus.on(event, callback);
    },

    off: function(event) {
        this.bus.off(event);
    }
};

dispatch.init();
module.exports = dispatch;
