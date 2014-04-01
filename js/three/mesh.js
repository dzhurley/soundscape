define([
    'underscore',
    'threejs',
    './scene'
], function(_, THREE, scene) {

    var radius = 10;
    var widthAndHeight = 10;

    var globe = new THREE.Mesh(
        new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight),
        new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors,
            wireframe: true
        })
    );

    var stars = [];
    var star;

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
        radius: radius,
        widthAndHeight: widthAndHeight,

        globe: globe,
        stars: stars,

        addToScene: function() {
            this.wrangleVertices();
            scene.add(mesh.globe);
            $.map(mesh.stars, function(star) {
                scene.add(star);
            });
        },

        wrangleVertices: function() {
            // THREE doesn't combine the two polar vertices into one object,
            // instead storing a separate vertex for each face that connects
            // to the pole. These return the groupings of both pole's vertices
            // to compare with in processing.faces.validFace.
            this.northVerts = _.filter(globe.geometry.vertices, function(v) {
                return v.y === radius;
            });
            this.southVerts = _.filter(globe.geometry.vertices, function(v) {
                return v.y === -radius;
            });

            function indexify(vert) {
                return globe.geometry.vertices.indexOf(vert);
            }
            this.northVerts = _.map(this.northVerts, indexify);
            this.southVerts = _.map(this.southVerts, indexify);

            // there exists a seam on the globe running across the surface from
            // pole to pole where 2 vertices share the same coordinates. we need
            // pairings of these seam vertices to properly find valid adjacent
            // faces in processing.faces.validFace.
            var wh = this.widthAndHeight;
            this.seams = {};

            var first;
            var pair;
            var second;
            for (var i = 1; i < this.widthAndHeight; i++) {
                first = (i * this.widthAndHeight) + i;
                second = ((i + 1) * this.widthAndHeight) + i;
                pair = [first, second];

                // store at both spots for more reasonable lookup
                this.seams[first] = pair;
                this.seams[second] = pair;
            }
        },

        update: function() {
            this.globe.geometry.colorsNeedUpdate = true;
        }
    };

    return mesh;
});
