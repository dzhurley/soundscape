importScripts('../../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        eventEmitter: '../bower_components/eventemitter2/lib/eventemitter2',

        threejs: '../bower_components/threejs/build/three',
        heds: 'lib/HalfEdgeStructure',

        artists: 'artists',
        constants: 'constants',
        three: 'three',
        plotting: 'plotting',
        helpers: 'helpers'
    },

    shim: {
        eventEmitter: { exports: 'EventEmitter' },

        threejs: { exports: 'THREE' },

        heds: {
            deps: ['threejs'],
            exports: 'THREE'
        }
    }
}, [
    'underscore',
    'constants',
    'three/mesh/utils',
    'heds',
    'artists',
    'plotting/seeder'
], function(_, Constants, Utils, THREE, ArtistManager, Plotter) {
    EventManager = function() {
        return {
            dispatchEvent: function(evt) {
                return this[evt.data.type](evt.data.payload);
            },

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
                App.plotter.stop = false;
                this.remaining = App.plotter.seed(JSON.parse(payload));
                // TODO: send back progress
                postMessage({
                    type: 'seeded',
                    payload: {
                        faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                    }
                });
            },

            processOneArtist: function() {
                return App.plotter.looper.loopOnce(this.remaining);
            },

            oneArtist: function() {
                this.processOneArtist();

                // TODO: send back progress
                postMessage({
                    type: 'looped',
                    payload: {
                        faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                    }
                });
            },

            batchOnce: function() {
                for (var j = 0; j <= App.plotter.batchSize; j++) {
                    if (this.processOneArtist()) {
                        break;
                    }
                }

                // TODO: send back progress
                postMessage({
                    type: 'batched',
                    payload: {
                        faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                    }
                });
            },

            batch: function() {
                for (var i = 0; i < this.remaining.length; i++) {
                    this.batchOnce();

                    if (App.plotter.stop) {
                        break;
                    }
                }
            },

            edgesForArtist: function(payload) {
                var edges = App.artistManager.edgesForArtist(payload);
                postMessage({
                    type: 'edgesForArtist',
                    payload: { edges: edges }
                });
            }
        };
    };

    onmessage = function(evt) {
        if (!self.App) {
            self.App = {};
            var geometry = new THREE.SphereGeometry(Constants.globe.radius,
                                                    Constants.globe.widthAndHeight,
                                                    Constants.globe.widthAndHeight);
            var material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            });
            self.App.mesh = new THREE.Mesh(geometry, material);
            self.App.heds = new THREE.HalfEdgeStructure(self.App.mesh.geometry);
            self.App.mesh.utils = new Utils(self.App.mesh);
            self.App.plotter = new Plotter(self.App.mesh);
            self.App.artistManager = new ArtistManager();
            self.App.eventManager = new EventManager();
        }

        self.App.eventManager.dispatchEvent(evt);
    };
});
