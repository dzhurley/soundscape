importScripts('../../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../../bower_components/requirejs-text/text',
        underscore: '../../bower_components/underscore-amd/underscore-min',

        threejs: '../../bower_components/threejs/build/three',

        constants: '../constants',
        three: '../three',
        processing: '../processing',
        helpers: '../helpers'
    },

    shim: {
        eventbus: { exports: 'EventBus' },
        threejs: { exports: 'THREE' }
    }
}, [
    'underscore',
    'constants',
    'processing/seeder'
], function(_, Constants, Processor) {

    this.Constants = Constants;
    this.Processor = Processor;

    onmessage = function(evt) {
        if (evt.data.msg === 'start!') {
            return;
        }

        var artists = evt.data.artists;

        // minimal mesh with same constants to work against in worker
        this.mesh = this.mesh || new THREE.Mesh(
            new THREE.SphereGeometry(Constants.globe.radius,
                                     Constants.globe.widthAndHeight,
                                     Constants.globe.widthAndHeight),
            new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            })
        );

        this.processor = this.processor || new Processor(this.mesh);

        var msg = '';
        var newFaces = function(faces) {
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
        };

        if (evt.data.msg === 'seed!') {
            this.remaining = this.processor.seed(JSON.parse(artists));
            // TODO: send back progress
            postMessage({
                msg: 'seeded!',
                faces: JSON.stringify(newFaces(this.mesh.geometry.faces))
            });
        }

        if (evt.data.msg === 'batch!') {
            for (var i = 0; i < this.remaining.length; i++) {
                for (var j = 0; j <= this.processor.batchSize; j++) {
                    if (this.processor.looper.loopOnce(this.remaining)) {
                        break;
                    }
                }

                // TODO: send back progress
                postMessage({
                    msg: 'batched!',
                    faces: JSON.stringify(newFaces(this.mesh.geometry.faces))
                });

                if (this.stop) {
                    break;
                }
            }
        }
    };
});
