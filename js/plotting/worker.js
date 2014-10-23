importScripts('../../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../../bower_components/requirejs-text/text',
        underscore: '../../bower_components/underscore-amd/underscore-min',

        threejs: '../../bower_components/threejs/build/three',

        constants: '../constants',
        three: '../three',
        plotting: '../plotting',
        helpers: '../helpers'
    },

    shim: {
        eventbus: { exports: 'EventBus' },
        threejs: { exports: 'THREE' }
    }
}, [
    'underscore',
    'constants',
    'three/mesh/utils',
    'plotting/seeder'
], function(_, Constants, Utils, Plotter) {
    // stick args in the worker context
    this.globe = Constants.globe;
    this.Utils = Utils;
    this.Plotter = Plotter;

    this.EventManager = function() {
        var eventManager = {
            dispatchEvent: function(evt) {
                return this[evt.data.msg](evt);
            },

            init: function() {
                var geometry = new THREE.SphereGeometry(globe.radius,
                                                        globe.widthAndHeight,
                                                        globe.widthAndHeight);
                var material = new THREE.MeshLambertMaterial({
                    shading: THREE.FlatShading,
                    side: THREE.DoubleSide,
                    vertexColors: THREE.FaceColors
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.utils = new Utils(this.mesh);
                this.plotter = new Plotter(this.mesh);
            },

            newFaces: function(faces) {
                return _.compact(_.map(faces, function(face) {
                    var indexedFace = null;

                    if (face.data.pending) {
                        var index = faces.indexOf(face).toString();
                        indexedFace = {};
                        indexedFace[index] = face;
                        delete face.data.pending;
                    }

                    return indexedFace;
                }));
            },

            seed: function(evt) {
                // reset stopping flag
                this.plotter.stop = false;
                this.remaining = this.plotter.seed(JSON.parse(evt.data.artists));
                // TODO: send back progress
                postMessage({
                    msg: 'seeded',
                    faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
                });
            },

            batch: function(evt) {
                for (var i = 0; i < this.remaining.length; i++) {
                    for (var j = 0; j <= this.plotter.batchSize; j++) {
                        if (this.plotter.looper.loopOnce(this.remaining)) {
                            break;
                        }
                    }

                    // TODO: send back progress
                    postMessage({
                        msg: 'batched',
                        faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
                    });

                    if (this.plotter.stop) {
                        break;
                    }
                }
            }
        };

        eventManager.init();
        return eventManager;
    };

    onmessage = function(evt) {
        this.eventManager = this.eventManager || new EventManager();
        this.eventManager.dispatchEvent(evt);
    };
});
