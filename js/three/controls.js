// TODO find a better way
let THREE = require('../lib/FlyControls');
THREE = require('../lib/OrbitControls');

let Threes = require('./main');
let DOM = require('../dom');

class Controls {
    constructor(label='Orbital') {
        this.label = label;
        this[`setup${label}`]();
    }

    setButtonText(text) {
        document.getElementById('toggleControls').textContent = text;
    }

    setupFly() {
        this.active = new THREE.FlyControls(Threes.camera, DOM.container);
        Object.assign(this.active, {
            autoForward: false,
            domElement: DOM.container,
            dragToLook: true,
            movementSpeed: 1,
            rollSpeed: 0.03
        });
    }

    setupOrbital() {
        this.active = new THREE.OrbitControls(Threes.camera, DOM.container);
        Object.assign(this.active, {
            zoomSpeed: 0.2,
            rotateSpeed: 0.5,
            noKeys: true
        });
    }

    toggleControls() {
        let prevCamera = Threes.camera;

        Threes.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000);
        Threes.camera.position.copy(prevCamera.position);
        Threes.camera.rotation.copy(prevCamera.rotation);

        this.label = this.label === 'Orbital' ? 'Fly' : 'Orbital';
        this.setButtonText(this.label);
        return this[`setup${this.label}`]()
    }

    update(interval) {
        this.active.update(interval);
    }
}

module.exports = Controls;
