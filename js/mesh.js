define([
    'three',
    'scene'
], function(THREE, scene) {

    var stars = [], star;

    for (var i = 0; i < 1000; ++i) {
        star = new THREE.Sprite(new THREE.SpriteMaterial());
        star.position.x = Math.random() * 2 - 1;
        star.position.y = Math.random() * 2 - 1;
        star.position.z = Math.random() * 2 - 1;

        star.position.normalize();
        star.position.multiplyScalar(Math.random() * 100 + 50);
        star.scale.multiplyScalar(Math.random() * 0.5);
        stars.push(star);
    }

    var mesh = {
        globe: new THREE.Mesh(
            new THREE.SphereGeometry(10, 100, 100),
            new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            })
        ),

        stars: stars,

        addToScene: function() {
            scene.add(mesh.globe);
            $.map(mesh.stars, function(star) {
                scene.add(star);
            });
        },

        update: function() {
            this.globe.geometry.colorsNeedUpdate = true;
        }
    };

    return mesh;
});
