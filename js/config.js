requirejs.config({
    deps: ['main'],

    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        eventEmitter: '../bower_components/eventemitter2/lib/eventemitter2',

        threejs: '../bower_components/threejs/build/three',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls',
        heds: './lib/HalfEdgeStructure',

        sources: 'sources',
        lib: 'lib',
        three: 'three'
    },

    shim: {
        eventEmitter: { exports: 'EventEmitter' },

        threejs: { exports: 'THREE' },

        fly: {
            deps: ['threejs'],
            exports: 'THREE'
        },

        orbital: {
            deps: ['threejs'],
            exports: 'THREE'
        },

        heds: {
            deps: ['threejs'],
            exports: 'THREE'
        }
    }
});
