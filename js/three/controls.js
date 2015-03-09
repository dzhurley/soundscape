// TODO find a better way
var THREE = require('../lib/FlyControls');
THREE = require('../lib/OrbitControls');

var App = require('../app');
var Threes = require('./main');

var controls = {
    init: function() {
        this.setupOrbital();
    },

    setButtonText: function() {
        var newLabel = this.label === 'Orbital' ? 'Fly' : 'Orbital';
        // TODO: put back on App
        document.getElementById('toggleControls').textContent = newLabel;
    },

    setupFly: function() {
        this.active = new THREE.FlyControls(Threes.camera, App.container);
        this.active.autoForward = false;
        this.active.domElement = App.container;
        this.active.dragToLook = true;
        this.active.movementSpeed = 1;
        this.active.rollSpeed = 0.03;
        this.label = 'Fly';
        this.setButtonText();
    },

    setupOrbital: function() {
        this.active = new THREE.OrbitControls(Threes.camera, App.container);
        this.active.zoomSpeed = 0.2;
        this.active.rotateSpeed = 0.5;
        this.active.noKeys = true;
        this.label = 'Orbital';
        this.setButtonText();
    },

    toggleControls: function() {
        var prevCamera = Threes.camera;
        Threes.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000);
            Threes.camera.position.copy(prevCamera.position);
            Threes.camera.rotation.copy(prevCamera.rotation);

            return this.label === 'Fly' ?
                this.setupOrbital() :
                this.setupFly();
    },

    update: function(interval) {
        this.active.update(interval);
    }
};
controls.init();
module.exports = controls;
