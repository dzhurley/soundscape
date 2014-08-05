define([
    'fly',
    'three/camera'
], function(THREE, camera) {
    var controls = new THREE.FlyControls(camera);

    return {
        bindControls: function() {
            controls.autoForward = false;
            controls.domElement = App.$container[0];
            controls.dragToLook = true;
            controls.movementSpeed = 1;
            controls.rollSpeed = 0.03;
        },

        update: function(interval) {
            controls.update(interval);
        }
    };
});
