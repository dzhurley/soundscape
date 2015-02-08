define([
    'underscore'
], function(_) {
    return function() {
        var plotter = {
            init: function() {
                this.worker = new Worker('js/plotting/worker.js');
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
                this.worker.onmessage = function(evt) {
                    // TODO: better dispatch

                    if (evt.data.msg === 'edgesForArtist') {
                        App.hud.setVerticesFromArtistEdges(evt.data.edges);
                        return;
                    }

                    var newFaces = JSON.parse(evt.data.faces);
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
                }.bind(this);
            }
        };

        plotter.init();
        return plotter;
    };
});
