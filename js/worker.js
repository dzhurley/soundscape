// WebWorker used for initial seeding and painted of the globe.
//
// Events funnel in from emitOnWorker and are pushed out on emitOnMain.

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
