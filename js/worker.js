importScripts('../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        threejs: '../bower_components/threejs/build/three',

        lib: 'lib',
        three: 'three',
        processing: 'processing'
    },

    shim: {
        eventbus: {
            exports: 'EventBus'
        },

        threejs: {
            exports: 'THREE'
        }
    }
}, [
    'underscore',
    'three/mesh/edger',
    'three/mesh/facer'
], function(_, Edger, Facer) {
    // TODO: how do i stick these args in the onmessage context?
    onmessage = function(evt) {
        postMessage('from the worker: ' + evt.data);
    };
});
