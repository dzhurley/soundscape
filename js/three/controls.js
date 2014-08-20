define([
    'fly',
    'three/camera'
], function(THREE, camera) {
    return function() {
        var controls = new THREE.FlyControls(camera);

        return {
            bindControls: function() {
                controls.autoForward = false;
                controls.domElement = App.container;
                controls.dragToLook = true;
                controls.movementSpeed = 1;
                controls.rollSpeed = 0.03;
            },

            update: function(interval) {
                controls.update(interval);
            }
        };
    };
});
