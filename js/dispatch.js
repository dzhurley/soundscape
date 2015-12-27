'use strict';

/* Conduit for main and worker appwide events
 *
 * Validates against cataloged list of events
 *
 * TODO: needs to be able to manage multiple workers
 */

const EventEmitter = require('eventemitter2');
const events = require('./events');

const emitter = new EventEmitter({ wildcard: true });

const isValidEvent = event => events.indexOf(event) > -1;

function addWorker(worker) {
    emitter.worker = worker;
    emitter.worker.onmessage = event => {
        let { data: { type, payload } } = event;
        return isValidEvent(type) ? emitter.emit(type, payload) : false;
    };
    emitter.worker.onerror = () => console.error(`Worker Error: ${arguments}`);
}

const emit = (type, ...args) => isValidEvent(type) ? emitter.emit(type, ...args) : false;
const on = (type, fn) => isValidEvent(type) ? emitter.on(type, fn) : false;

function emitOnWorker(type, payload) {
    return isValidEvent(type) ? emitter.worker.postMessage({ type, payload }) : false;
}

module.exports = { addWorker, emit, emitOnWorker, on };
