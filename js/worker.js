importScripts('../bower_components/requirejs/require.js');

require({
    paths: {
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore-amd/underscore-min',

        eventEmitter: '../bower_components/eventemitter2/lib/eventemitter2',

        threejs: '../bower_components/threejs/build/three',
        heds: 'lib/HalfEdgeStructure',

        artists: 'artists',
        constants: 'constants',
        three: 'three',
        plotting: 'plotting',
        helpers: 'helpers'
    },

    shim: {
        eventEmitter: { exports: 'EventEmitter' },

        threejs: { exports: 'THREE' },

        heds: {
            deps: ['threejs'],
            exports: 'THREE'
        }
    }
}, [
    'underscore',
    'constants',
    'eventEmitter',
    'artists',
    'heds',
    'three/mesh/utils',
    'plotting/worker'
], function(_, Constants, EventEmitter, ArtistManager, THREE, Utils, Plotter) {
    function startWorker() {
        self.App = {};
        var geometry = new THREE.SphereGeometry(Constants.globe.radius,
                                                Constants.globe.widthAndHeight,
                                                Constants.globe.widthAndHeight);
        var material = new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        });

        self.App.mesh = new THREE.Mesh(geometry, material);
        self.App.heds = new THREE.HalfEdgeStructure(self.App.mesh.geometry);
        self.App.mesh.utils = new Utils(self.App.mesh);
        self.App.bus = new EventEmitter({ wildcard: true });
        self.App.artistManager = new ArtistManager();
        self.App.plotter = new Plotter(self.App.mesh);
    }

    onmessage = function(event) {
        if (!self.App) {
            startWorker();
        }

        // expose namespaced method as first arg to callback
        if (event.data.type.indexOf('.') > -1) {
            self.App.bus.emit(event.data.type,
                          event.data.type.split('.')[1],
                          event.data.payload);
        } else {
            self.App.bus.emit(event.data.type, event.data.payload);
        }
    };
});
