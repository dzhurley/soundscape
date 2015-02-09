importScripts('../../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../../bower_components/requirejs-text/text',
        underscore: '../../bower_components/underscore-amd/underscore-min',

        threejs: '../../bower_components/threejs/build/three',
        heds: '../lib/HalfEdgeStructure',

        artists: '../artists',
        constants: '../constants',
        three: '../three',
        plotting: '../plotting',
        helpers: '../helpers'
    },

    shim: {
        eventbus: { exports: 'EventBus' },

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
    // stick args in the worker context
    this.globe = Constants.globe;
    this.Utils = Utils;
    this.Plotter = Plotter;

    this.EventManager = function() {
        return {
            dispatchEvent: function(evt) {
                return this[evt.data.msg](evt);
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

            seed: function(evt) {
                // reset stopping flag
                App.plotter.stop = false;
                this.remaining = App.plotter.seed(JSON.parse(evt.data.artists));
                // TODO: send back progress
                postMessage({
                    msg: 'seeded',
                    faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                });
            },

            processOneArtist: function() {
                return App.plotter.looper.loopOnce(this.remaining);
            },

            oneArtist: function(evt) {
                this.processOneArtist();

                // TODO: send back progress
                postMessage({
                    msg: 'looped',
                    faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                });
            },

            batchOnce: function(evt) {
                for (var j = 0; j <= App.plotter.batchSize; j++) {
                    if (this.processOneArtist()) {
                        break;
                    }
                }

                // TODO: send back progress
                postMessage({
                    msg: 'batched',
                    faces: JSON.stringify(this.newFaces(App.mesh.geometry.faces))
                });
            },

            batch: function(evt) {
                for (var i = 0; i < this.remaining.length; i++) {
                    this.batchOnce(evt);

                    if (App.plotter.stop) {
                        break;
                    }
                }
            },

            edgesForArtist: function(evt) {
                var edges = App.artistManager.edgesForArtist(evt.data.artistName);
                postMessage({
                    msg: 'edgesForArtist',
                    edges: edges
                });
            }
        };
    };

    onmessage = function(evt) {
        if (!this.App) {
            this.App = {};
            var geometry = new THREE.SphereGeometry(globe.radius,
                                                    globe.widthAndHeight,
                                                    globe.widthAndHeight);
            var material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            });
            this.App.mesh = new THREE.Mesh(geometry, material);
            this.App.heds = new THREE.HalfEdgeStructure(this.App.mesh.geometry);
            this.App.mesh.utils = new Utils(this.App.mesh);
            this.App.plotter = new Plotter(this.App.mesh);
            this.App.artistManager = new ArtistManager();
            this.App.eventManager = new EventManager();
        }

        this.App.eventManager.dispatchEvent(evt);
    };
});
