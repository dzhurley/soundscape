var _ = require('underscore');
var EventEmitter = require('eventemitter2').EventEmitter2;

var Constants = require('./constants');
var ArtistManager = require('./artists');
var THREE = require('./lib/HalfEdgeStructure');
var Utils = require('./three/mesh/utils');
var Plotter = require('./plotting/worker');

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

    // TODO: explore transferrable objects for artists
    self.App.bus.emit('getArtists');
};
