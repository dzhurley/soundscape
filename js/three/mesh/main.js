var _ = require('underscore');
var h = require('../../helpers');
var Constants = require('../../constants');
var THREE = require('../../lib/HalfEdgeStructure');

var Dispatch = require('../../dispatch');
var App = require('../../app');
var scene = require('../scene');
var Utils = require('./utils');

var mesh = {
    radius: Constants.globe.radius,
    widthAndHeight: Constants.globe.widthAndHeight,

    init: function() {
        this.globe = this.createGlobe();
        this.heds = new THREE.HalfEdgeStructure(this.globe.geometry);
        this.wireframe = this.createWireframe();
        this.stars = this.createStars();

        this.utils = new Utils(this.globe);

        Dispatch.on('debugging', this.toggleDebugging.bind(this));
        Dispatch.on('faces.*', function(payload) {
            this.updateFaces(JSON.parse(payload.faces));
        }.bind(this));
    },

    resetGlobe: function() {
        this.utils.resetFaces();
    },

    createGlobe: function() {
        return new THREE.Mesh(
            new THREE.SphereGeometry(this.radius,
                                     this.widthAndHeight,
                                     this.widthAndHeight),
                                     new THREE.MeshLambertMaterial({
                                         shading: THREE.FlatShading,
                                         side: THREE.DoubleSide,
                                         vertexColors: THREE.FaceColors
                                     })
        );
    },

    createWireframe: function() {
        return new THREE.WireframeHelper(this.globe);
    },

    createStars: function() {
        var stars = [];
        var star;

        for (var i = 0; i < Constants.stars.number; ++i) {
            star = new THREE.Sprite(new THREE.SpriteMaterial());
            star.position.x = Constants.stars.initialX();
            star.position.y = Constants.stars.initialY();
            star.position.z = Constants.stars.initialZ();

            star.position.normalize();
            star.position.multiplyScalar(Constants.stars.positionMultiplier());
            star.scale.multiplyScalar(Constants.stars.scaleMultiplier());
            stars.push(star);
        }
        return stars;
    },

    addToScene: function() {
        scene.add(mesh.globe);
        if (App.debugging) {
            scene.add(mesh.wireframe);
        }
        _.map(mesh.stars, function(star) {
            scene.add(star);
        });
    },

    toggleDebugging: function(evt) {
        return App.debugging ? scene.add(this.wireframe) : scene.remove(this.wireframe);
    },

    updateFaces: function(newFaces) {
        var oldFaces = this.globe.geometry.faces;

        function getFaceIndex(face) {
            return parseInt(_.keys(face)[0], 10);
        }

        console.log('painting new faces:', _.map(newFaces, function(face) {
            return getFaceIndex(face);
        }));

        _.each(newFaces, function(face) {
            index = getFaceIndex(face);
            oldFaces[index].color.copy(face[index].color);
            oldFaces[index].data = face[index].data;
        }.bind(this));

        this.globe.geometry.colorsNeedUpdate = true;
    }
};

mesh.init();
module.exports = mesh;
