define([
    'three',
    'renderer'
], function(THREE, renderer) {
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    $(window).resize(function() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    camera.position.y = 20;
    camera.position.z = 30;

    return camera;
});
