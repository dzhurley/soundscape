'use strict';

/* WebWorker used for initial seeding and painted of the globe
 *
 * Events funnel in from the main thread's Dispatch.emitOnWorker
 * and are pushed out on the worker's Dispatch to seed or batch
 * paint faces on the sphere.
 *
 * A minimal mirror of the main scene is made in startWorker to
 * use in all the plotting module's workings.
 */

onmessage = function(evt) {
    let { data: { type, payload } } = evt;
    if (!self.started) {
        self.emit = require('./dispatch').emit;
        self.on = require('./dispatch').on;

        const THREE = require('./lib/HalfEdgeStructure');
        const globe = require('./three/globe');
        const plotter = require('./plotting/worker');

        self.HEDS = new THREE.HalfEdgeStructure(globe.geometry);
        self.on('plot.*', (method, payload) => plotter[method](payload));
        self.started = true;
    }

    // expose namespaced method as first arg to callback
    type.includes('.') ?
        self.emit(type, type.split('.')[1], payload) :
        self.emit(type, payload);

    // TODO: explore transferrable objects for syncing artists
    self.emit('getArtists');
};
