define([
    'underscore',
    'threejs',
    'three/scene',
    'three/mesh/edger',
    'three/mesh/facer'
], function(_, THREE, scene, Edger, Facer) {

    var radius = 50;
    var widthAndHeight = 50;

    var globe = new THREE.Mesh(
        new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight),
        new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        })
    );

    var outlines = new THREE.Mesh(
        new THREE.SphereGeometry(radius + 0.1, widthAndHeight, widthAndHeight),
        new THREE.MeshLambertMaterial({
            color: new THREE.Color(0x000000),
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            wireframe: true,
            wireframeLineWidth: 2
        })
    );

    var stars = [];
    var star;

    for (var i = 0; i < 100; ++i) {
        star = new THREE.Sprite(new THREE.SpriteMaterial());
        star.position.x = Math.random() * 2 - 1;
        star.position.y = Math.random() * 2 - 1;
        star.position.z = Math.random() * 2 - 1;

        star.position.normalize();
        star.position.multiplyScalar(Math.random() * 100 + 200);
        star.scale.multiplyScalar(Math.random() * 0.5);
        stars.push(star);
    }

    var mesh = {
        radius: radius,
        widthAndHeight: widthAndHeight,

        globe: globe,
        outlines: outlines,
        stars: stars,

        addToScene: function() {
            this.edger = new Edger(this.globe.geometry);
            this.facer = new Facer(this.globe.geometry);

            scene.add(mesh.globe);
            if (App.outlines) {
                scene.add(mesh.outlines);
            }
            _.map(mesh.stars, function(star) {
                scene.add(star);
            });
        },

        update: function() {
            this.globe.geometry.colorsNeedUpdate = true;
        }
    };

    return mesh;
});
