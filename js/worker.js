importScripts('../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        threejs: '../bower_components/threejs/build/three',

        three: 'three',
        processing: 'processing'
    },

    shim: {
        eventbus: { exports: 'EventBus' },
        threejs: { exports: 'THREE' }
    }
}, [
    'underscore',
    'constants',
    'three/mesh/edger',
    'three/mesh/facer'
], function(_, Constants, Edger, Facer) {
    // stick these arguments in the current context to stick around
    // when messages come through
    this.Constants = Constants;
    this.Edger = Edger;
    this.Facer = Facer;

    onmessage = function(evt) {
        if (evt.data.status !== 'process!') {
            postMessage(JSON.stringify({ msg: 'bailed!' }));
        }

        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(Constants.globe.radius,
                                     Constants.globe.widthAndHeight,
                                     Constants.globe.widthAndHeight),
            new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            })
        );

        postMessage(JSON.stringify({
            msg: 'processed!',
            edges: mesh.geometry.vertices,
            faces: mesh.geometry.faces
        }));
    };
});
