define([
    'underscore',
    'eventEmitter',
], function(_, EventEmitter) {
    return function() {
        var dispatch = {
            init: function() {
                this.bus = new EventEmitter({ wildcard: true });

                this.worker = new Worker('js/worker.js');
                this.worker.onmessage = this.onWorkerMessage.bind(this);
                this.worker.onerror = this.onWorkerError.bind(this);

                this.bus.on('worker.*', this.emitOnWorker.bind(this));
            },

            onWorkerMessage: function(event) {
                if (event.data.type === 'edgesForArtist') {
                    App.hud.setVerticesFromArtistEdges(event.data.payload.edges);
                    return;
                }

                var newFaces = JSON.parse(event.data.payload.faces);
                var oldFaces = App.three.mesh.globe.geometry.faces;

                function getFaceIndex(face) {
                    return parseInt(_.keys(face)[0], 10);
                }

                console.log('painting new faces:', _.map(newFaces, function(face) {
                    return getFaceIndex(face);
                }));

                _.each(newFaces, function(face) {
                    index = getFaceIndex(face);
                    oldFaces[index].color.copy(face[index].color);
                    oldFaces[index].data = face[index].data;
                }.bind(this));

                App.three.mesh.globe.geometry.colorsNeedUpdate = true;

                // this.bus.trigger(event.data.type, evt.data.payload);
            },

            onWorkerError: function(event) {
                console.error('Worker Error:', arguments);
            },

            emitOnWorker: function(event, data) {
                this.worker.postMessage({
                    type: event,
                    payload: data
                });
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
        return dispatch;
    };
});
