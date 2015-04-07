let THREE = require('three');
let renderer = require('./renderer');

class Camera extends THREE.PerspectiveCamera {
    constructor(fov, aspect, near, far) {
        super(fov, aspect, near, far);

        // TODO: constants
        this.position.y = 100;
        this.position.z = 100;

        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();
    }
}

// TODO: constants
module.exports = new Camera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
