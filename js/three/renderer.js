define([
    'threejs'
], function(THREE) {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
});
