define([
    'three',
    'scene'
], function(THREE, scene) {
    var light = {
        ambient: new THREE.AmbientLight(0xf0f0f0),
        directional: new THREE.DirectionalLight(0xffffff, 0.5),

        addToScene: function() {
            scene.add(light.ambient);
            scene.add(light.directional);
        }
    };

    light.directional.position.set(15, 15, 20);

    return light;
});
