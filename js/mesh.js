define([
    'three'
], function(THREE) {
    var mesh = {
        globe: new THREE.Mesh(
            new THREE.SphereGeometry(10, 30, 20),
            new THREE.MeshLambertMaterial({
                ambient: 0x00ff00,
                color: 0x00ff00,
                shading: THREE.FlatShading
            })
        ),

        stars: new THREE.Mesh(
            new THREE.SphereGeometry(90, 64, 64),
            new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/stars.png'),
                side: THREE.BackSide
            })
        )
    };

    return mesh;
});
