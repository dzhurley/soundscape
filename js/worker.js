/* WebWorker used for initial seeding and painted of the globe
 *
 * Events funnel in from the main thread's Dispatch.emitOnWorker
 * and are pushed out on the worker's Dispatch.
 */

onmessage = evt => {
    let { data: { type, payload } } = evt;
    if (!self.started) {
        self.emit = require('dispatch').emit;

        self.nodes = require('seeding/nodes');
        self.nodes.create();

        self.started = true;
    }

    self.emit(type, payload);
};
