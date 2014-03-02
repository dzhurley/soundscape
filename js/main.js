requirejs.config({
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/jquery.min',
        underscore: '../bower_components/underscore-amd/underscore-min',

        dat: '../bower_components/dat.gui/dat.gui.min',

        three: '../bower_components/threejs/build/three.min',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls'
    },

    shim: {
        dat: {
            exports: 'dat'
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
    'app',
    'dat'
], function(App, dat) {
    var app = window.App = new App();
    app.init();

    var gui = new dat.GUI();
    gui.add(app, 'spin');
    gui.add(app, 'showHeadsUp');
    gui.add(app, 'debug');
});
