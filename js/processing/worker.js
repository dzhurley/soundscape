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
        if (evt.data.msg !== 'process!') {
            postMessage(JSON.stringify({ msg: 'bailed!' }));
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
        this.processor.seed(JSON.parse(artists));

        var newFaces = _.compact(_.map(this.mesh.geometry.faces, _.bind(function(face) {
            var indexedFace = null;

            if (face.data.artist) {
                var index = this.mesh.geometry.faces.indexOf(face).toString();
                indexedFace = {};
                indexedFace[index] = face;
            }

            return indexedFace;
        }, this)));

        postMessage({
            msg: 'processed!',
            faces: JSON.stringify(newFaces)
        });
    };
});
