define([
    'three'
], function(THREE) {
    var light = {
        ambient: new THREE.AmbientLight(0x404040),
        directional: new THREE.DirectionalLight(0xffffff, 0.5)
    };

    light.directional.position.set(15, 15, 20);

    return light;
});
