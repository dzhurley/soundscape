requirejs.config({
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/jquery.min',
        underscore: '../bower_components/underscore-amd/underscore-min',

        dat: '../bower_components/dat.gui/dat.gui.min',
        eventbus: '../bower_components/EventBus/dist/EventBus.min',

        three: '../bower_components/threejs/build/three.min',
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

        three: {
            exports: 'THREE'
        },

        fly: {
            deps: ['three'],
            exports: 'THREE'
        },

        orbital: {
            deps: ['three'],
            exports: 'THREE'
        }
    }
});

requirejs([
    'app'
], function(App) {
    var app = window.App = new App();
    app.init();
});
