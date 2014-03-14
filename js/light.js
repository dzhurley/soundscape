define([
    'three',
    'scene'
], function(THREE, scene) {
    var light = {
        ambient: new THREE.AmbientLight(0xf0f0f0),

        addToScene: function() {
            scene.add(light.ambient);
        }
    };

    return light;
});
