/* WebWorker used for initial seeding and painted of the globe
 *
 * Events funnel in from the main thread's Dispatch.emitOnWorker
 * and are pushed out on the worker's Dispatch.
 */

onmessage = evt => {
    let { data: { type, payload } } = evt;
    if (!self.started) {
        self.emit = require('dispatch').emit;
        self.on = require('dispatch').on;

        self.nodes = require('seeding/nodes');
        self.started = true;
    }

    // expose namespaced method as first arg to callback
    type.includes('.') ?
        self.emit(type, type.split('.')[1], payload) :
        self.emit(type, payload);
};
