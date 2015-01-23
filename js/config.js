requirejs.config({
    deps: ['main'],

    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        eventbus: '../bower_components/EventBus/dist/EventBus',

        threejs: '../bower_components/threejs/build/three',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls',
        heds: './lib/HalfEdgeStructure',

        sources: 'sources',
        lib: 'lib',
        three: 'three',
        plotting: 'plotting'
    },

    shim: {
        eventbus: { exports: 'EventBus' },

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
