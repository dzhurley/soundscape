var _ = require('underscore');

var Dispatch = require('../dispatch');
var Seeder = require('./seeder');

var plotter = function(mesh) {
    this.seeder = new Seeder(mesh);

    Dispatch.on('plot.*', function(method, payload) {
        this[method](payload);
    }.bind(this));
};

_.extend(plotter.prototype, {
    newFaces: function(faces) {
        return _.compact(_.map(faces, function(face) {
            var indexedFace = null;

            if (face.data.pending) {
                var index = faces.indexOf(face).toString();
                indexedFace = {};
                indexedFace[index] = {
                    color: face.color,
                    data: face.data
                };
                delete face.data.pending;
            }

            return indexedFace;
        }));
    },

    seed: function(payload) {
        // reset stopping flag
        this.seeder.stop = false;
        this.remaining = this.seeder.seed(JSON.parse(payload));
        // TODO: send back progress
        postMessage({
            type: 'faces.seeded',
            payload: {
                faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
            }
        });
    },

    processOneArtist: function() {
        return this.seeder.looper.loopOnce(this.remaining);
    },

    oneArtist: function() {
        this.processOneArtist();

        // TODO: send back progress
        postMessage({
            type: 'faces.looped',
            payload: {
                faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
            }
        });
    },

    batchOnce: function() {
        for (var j = 0; j <= App.artistManager.artistsRemaining(); j++) {
            if (this.processOneArtist()) {
                break;
            }
        }

        // TODO: send back progress
        postMessage({
            type: 'faces.batched',
            payload: {
                faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
            }
        });
    },

    batch: function() {
        for (var i = 0; i < this.remaining.length; i++) {
            this.batchOnce();

            if (this.seeder.stop) {
                break;
            }
        }
    }
});

module.exports = plotter;
