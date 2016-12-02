// App-wide (main and worker threads) event delegation using EventEmitter2
//
// TODO: needs to be able to manage multiple workers

const EventEmitter = require('eventemitter2');
const { events } = require('constants');

const emitter = new EventEmitter({ wildcard: true });

// ensure an event, triggered or bound to, is known
const isValidEvent = event => events.some(e => event === e);

// worker lifecycle methods
const setMainWorker = worker => {
    emitter.worker = worker;
    emitter.worker.onmessage = event => {
        let { data: { type, payload } } = event;
        isValidEvent(type) && emitter.emit(type, payload);
    };
    emitter.worker.onerror = err => console.error(`Worker Error: ${err.message}`);
};
const stopMainWorker = () => emitter.worker && emitter.worker.terminate();

// same thread events
const emit = (type, ...args) => isValidEvent(type) && emitter.emit(type, ...args);
const on = (type, fn) => isValidEvent(type) && emitter.on(type, fn);

// main to worker events
const emitOnWorker = (type, payload) => {
    isValidEvent(type) && emitter.worker.postMessage({ type, payload });
};

// worker to main events
const emitOnMain = (type, payload) => {
    isValidEvent(type) && postMessage({ type, payload });
};

module.exports = { setMainWorker, stopMainWorker, emit, emitOnMain, emitOnWorker, on };
