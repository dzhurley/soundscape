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
    camera.position.z = 10;

    THREE.Camera.prototype.onRender = function(scene, options) {
        options = options || {};
        if (options.spin) {
            var x = camera.position.x;
            var z = camera.position.z;
            camera.position.x = x * Math.cos(0.0025) + z * Math.sin(0.0025);
            camera.position.z = z * Math.cos(0.0025) - x * Math.sin(0.0025);
        }
        camera.lookAt(scene.position);
    };

    return camera;
});
