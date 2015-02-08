importScripts('../../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../../bower_components/requirejs-text/text',
        underscore: '../../bower_components/underscore-amd/underscore-min',

        threejs: '../../bower_components/threejs/build/three',
        heds: '../lib/HalfEdgeStructure',

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
    'plotting/seeder'
], function(_, Constants, Utils, THREE, Plotter) {
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
                this.heds = new THREE.HalfEdgeStructure(this.mesh.geometry);
                this.mesh.utils = new Utils(this.mesh, this.heds);
                this.plotter = new Plotter(this.mesh);
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
                this.plotter.stop = false;
                this.remaining = this.plotter.seed(JSON.parse(evt.data.artists));
                // TODO: send back progress
                postMessage({
                    msg: 'seeded',
                    faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
                });
            },

            processOneArtist: function() {
                return this.plotter.looper.loopOnce(this.remaining);
            },

            oneArtist: function(evt) {
                this.processOneArtist();

                // TODO: send back progress
                postMessage({
                    msg: 'looped',
                    faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
                });
            },

            batchOnce: function(evt) {
                for (var j = 0; j <= this.plotter.batchSize; j++) {
                    if (this.processOneArtist()) {
                        break;
                    }
                }

                // TODO: send back progress
                postMessage({
                    msg: 'batched',
                    faces: JSON.stringify(this.newFaces(this.mesh.geometry.faces))
                });
            },

            batch: function(evt) {
                for (var i = 0; i < this.remaining.length; i++) {
                    this.batchOnce(evt);

                    if (this.plotter.stop) {
                        break;
                    }
                }
            },

            edgesForArtist: function(evt) {
                var artists = this.plotter.artister.artists;
                var artist = _.findWhere(artists, { name: evt.data.artistName });

                postMessage({
                    msg: 'edgesForArtist',
                    edges: artist.edges
                });
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
