requirejs.config({
    deps: ['main'],

    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        dat: '../bower_components/dat.gui/dat.gui.min',
        eventbus: '../bower_components/EventBus/dist/EventBus',

        threejs: '../bower_components/threejs/build/three',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls',

        lib: 'lib',
        three: 'three',
        processing: 'processing'
    },

    shim: {
        dat: {
            exports: 'dat'
        },

        eventbus: {
            exports: 'EventBus'
        },

        threejs: {
            exports: 'THREE'
        },

        fly: {
            deps: ['threejs'],
            exports: 'THREE'
        },

        orbital: {
            deps: ['threejs'],
            exports: 'THREE'
        }
    }
});
