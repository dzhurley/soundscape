define([
    'fly',
    'three/camera'
], function(THREE, camera) {
    return function() {
        // make sure to capture keys/mouse only within container
        var controls = new THREE.FlyControls(camera, App.container);

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
