requirejs.config({
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/jquery.min',
        underscore: '../bower_components/underscore-amd/underscore-min',

        dat: '../bower_components/dat.gui/dat.gui.min',
        eventbus: '../bower_components/EventBus/dist/EventBus',

        threejs: '../bower_components/threejs/build/three',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls'
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

requirejs([
    'app'
], function(App) {
    window.App = new App();
    window.App.init();
});
