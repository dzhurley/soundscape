define([
    'underscore'
], function(_) {
    return function() {
        var processor = {
            init: function() {
                this.worker = new Worker('js/processing/worker.js');
                // kick the worker off
                this.worker.postMessage('start!');

                this.initOnError();
                this.initOnMessage();
            },

            postMessage: function(msg) {
                this.worker.postMessage(msg);
            },

            initOnError: function() {
                this.worker.onerror = function() {
                    console.error('Worker Error:', arguments);
                };
            },

            initOnMessage: function() {
                this.worker.onmessage = _.bind(function(evt) {
                    var newFaces = JSON.parse(evt.data.faces);
                    var oldFaces = App.three.mesh.globe.geometry.faces;

                    _.each(newFaces, _.bind(function(face) {
                        var index = parseInt(_.keys(face)[0], 10);
                        oldFaces[index].color.copy(face[index].color);
                        oldFaces[index].data = face[index].data;
                    }, this));

                    App.three.mesh.globe.geometry.colorsNeedUpdate = true;

                    if (evt.data.msg === 'seeded!') {
                        this.postMessage({ msg: 'batch!'});
                    }
                }, this);
            }
        };

        processor.init();
        return processor;
    };
});
