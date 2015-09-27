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
    if (!self.started) {
        // add Dispatch to WebWorker context for one-time require() and on()
        self.Dispatch = require('./dispatch');
        let THREE = require('./lib/HalfEdgeStructure');
        let globe = require('./three/globe');
        let plotter = require('./plotting/worker');

        self.HEDS = new THREE.HalfEdgeStructure(globe.geometry);
        Dispatch.on('plot.*', (method, payload) => plotter[method](payload));
        self.started = true;
    }

    // expose namespaced method as first arg to callback
    if (evt.data.type.includes('.')) {
        Dispatch.emit(evt.data.type,
                      evt.data.type.split('.')[1],
                      evt.data.payload);
    } else {
        Dispatch.emit(evt.data.type, evt.data.payload);
    }

    // TODO: explore transferrable objects for syncing artists
    Dispatch.emit('getArtists');
};
