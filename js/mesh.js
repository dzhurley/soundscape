define([
    'three'
], function(THREE) {
    var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(10, 30, 20),
        new THREE.MeshLambertMaterial({
            ambient: 0x00ff00,
            color: 0x00ff00,
            shading: THREE.FlatShading
        })
    );

    return mesh;
});
