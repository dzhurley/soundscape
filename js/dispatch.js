/* Conduit for main and worker appwide events
 *
 * Validates against cataloged list of events
 *
 * TODO: needs to be able to manage multiple workers
 */

const EventEmitter = require('eventemitter2');
const { events } = require('constants');

const emitter = new EventEmitter({ wildcard: true });

const isValidEvent = event => events.some(e => {
    if (event === e) return true;
    // allow for event `dude.sweet` to match on `dude.*`
    const [space, specific] = e.split('.');
    return space === event.split('.')[0] && specific === '*';
});

const setMainWorker = worker => {
    emitter.worker = worker;
    emitter.worker.onmessage = event => {
        let { data: { type, payload } } = event;
        return isValidEvent(type) ? emitter.emit(type, payload) : false;
    };
    emitter.worker.onerror = err => console.error(`Worker Error: ${err.message}`);
};
const stopMainWorker = () => emitter.worker && emitter.worker.terminate();

const emit = (type, ...args) => isValidEvent(type) ? emitter.emit(type, ...args) : false;
const on = (type, fn) => isValidEvent(type) ? emitter.on(type, fn) : false;

const emitOnWorker = (type, payload) => isValidEvent(type) ?
    emitter.worker.postMessage({ type, payload }) :
    false;

module.exports = { setMainWorker, stopMainWorker, emit, emitOnWorker, on };
