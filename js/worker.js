module.exports = function() {
    require('es6-shim');

    let Dispatch = require('./dispatch');

    let Constants = require('./constants');
    let ArtistManager = require('./artists');
    let THREE = require('./lib/HalfEdgeStructure');
    let Utils = require('./three/mesh/utils');
    let Plotter = require('./plotting/worker');

    function startWorker() {
        self.App = {};
        let geometry = new THREE.SphereGeometry(Constants.globe.radius,
                                                Constants.globe.widthAndHeight,
                                                Constants.globe.widthAndHeight);
        let material = new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        });

        self.App.mesh = new THREE.Mesh(geometry, material);
        self.App.heds = new THREE.HalfEdgeStructure(self.App.mesh.geometry);
        self.App.mesh.utils = new Utils(self.App.mesh);
        self.App.artistManager = ArtistManager;
        self.plotter = new Plotter(self.App.mesh);
        self.started = true;
    }

    onmessage = function(evt) {
        if (!self.started) {
            startWorker();
        }

        // expose namespaced method as first arg to callback
        if (evt.data.type.includes('.')) {
            Dispatch.emit(evt.data.type,
                          evt.data.type.split('.')[1],
                          evt.data.payload);
        } else {
            Dispatch.emit(evt.data.type, evt.data.payload);
        }

        // TODO: explore transferrable objects for artists
        Dispatch.emit('getArtists');
    };
};
