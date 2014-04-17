define([
    'fly',
    './camera'
], function(THREE, camera) {
    var controls = new THREE.FlyControls(camera);

    return {
        bindControls: function() {
            controls.autoForward = false;
            controls.domElement = App.$container[0];
            controls.dragToLook = true;
            controls.movementSpeed = 0.5;
            controls.rollSpeed = 0.030;
        },

        update: function(interval) {
            controls.update(interval);
        }
    };
});
