define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene',
    'three/mesh/edger',
    'three/mesh/facer'
], function(_, h, THREE, scene, Edger, Facer) {
    return function() {
        var radius = 50;
        var widthAndHeight = 50;

        var mesh = {
            radius: radius,
            widthAndHeight: widthAndHeight,

            init: function() {
                this.globe = this.createGlobe();
                this.outlines = this.createOutlines();
                this.stars = this.createStars();
                this.marks = this.createEquaMarkers();
            },

            getGlobe: function() {
                return this.globe;
            },

            getFaces: function() {
                return this.globe.geometry.faces;
            },

            getVertices: function() {
                return this.globe.geometry.vertices;
            },

            resetGlobe: function() {
                this.facer.resetFaces();
            },

            createGlobe: function() {
                return new THREE.Mesh(
                    new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight),
                    new THREE.MeshLambertMaterial({
                        shading: THREE.FlatShading,
                        side: THREE.DoubleSide,
                        vertexColors: THREE.FaceColors
                    })
                );
            },

            createOutlines: function() {
                return new THREE.Mesh(
                    new THREE.SphereGeometry(radius + 0.1, widthAndHeight, widthAndHeight),
                    new THREE.MeshLambertMaterial({
                        color: new THREE.Color(0x000000),
                        shading: THREE.FlatShading,
                        side: THREE.DoubleSide,
                        wireframe: true,
                        wireframeLineWidth: 2
                    })
                );
            },

            createEquaMarkers: function() {
                var mark;
                var markers = [];
                var points = h.equidistantishPointsOnSphere(256);

                for (var i in points) {
                    mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
                    mark.position.x = points[i][0];
                    mark.position.y = points[i][1];
                    mark.position.z = points[i][2];
                    mark.position.multiplyScalar(radius);
                    markers.push(mark);
                }
                return markers;
            },

            createStars: function() {
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
                return stars;
            },

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
                _.map(mesh.marks, function(mark) {
                    scene.add(mark);
                });
            },

            update: function() {
                this.globe.geometry.colorsNeedUpdate = true;
            }
        };

        mesh.init();
        return mesh;
    };
});
