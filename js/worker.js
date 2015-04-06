module.exports = function() {
    require('es6-shim');

    let THREE = require('./lib/HalfEdgeStructure');

    let Dispatch = require('./dispatch');
    let Constants = require('./constants');
    let ArtistManager = require('./artists');
    let Utils = require('./three/mesh/utils');
    let Plotter = require('./plotting/worker');

    function startWorker() {
        let geometry = new THREE.SphereGeometry(Constants.globe.radius,
                                                Constants.globe.widthAndHeight,
                                                Constants.globe.widthAndHeight);
        let material = new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        });

        self.Mesh = new THREE.Mesh(geometry, material);
        self.HEDS = new THREE.HalfEdgeStructure(self.Mesh.geometry);
        self.Mesh.utils = new Utils(self.Mesh);
        self.ArtistManager = ArtistManager;
        self.Plotter = new Plotter(self.Mesh);
        self.started = true;
    }

    onmessage = function(evt) {
        if (!self.started) { startWorker(); }

        // expose namespaced method as first arg to callback
        if (evt.data.type.includes('.')) {
            Dispatch.emit(evt.data.type,
                          evt.data.type.split('.')[1],
                          evt.data.payload);
        } else {
            Dispatch.emit(evt.data.type, evt.data.payload);
        }

        // TODO: explore transferrable objects for syncing artists
        Dispatch.emit('getArtists');
    };
};
