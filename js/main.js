requirejs.config({
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/jquery.min',
        underscore: '../bower_components/underscore-amd/underscore-min',

        three: '../bower_components/threejs/build/three.min',
        fly: './lib/FlyControls',
        orbital: './lib/OrbitControls'
    },

    shim: {
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
