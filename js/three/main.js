let renderer = require('./renderer');
let camera = require('./camera');
let scene = require('./scene');
let light = require('./light');
let mesh = require('./mesh/main');

let threes = {
    camera,
    light,
    mesh,
    renderer,
    scene,

    setupScene() {
        this.light.addToScene();
        this.mesh.addToScene();

        this.camera.lookAt(scene.position);
        this.animate();
    },

    animate() {
        threes.controls && threes.controls.update(1);
        threes.renderer.render(threes.scene, threes.camera);
        window.requestAnimationFrame(threes.animate);
    }
};

module.exports = threes;
