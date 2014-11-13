define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene',
    'three/mesh/utils'
], function(_, h, THREE, scene, Utils) {
    return function() {
        var mesh = {
            radius: App.constants.globe.radius,
            widthAndHeight: App.constants.globe.widthAndHeight,

            init: function() {
                this.globe = this.createGlobe();
                this.outlines = this.createOutlines();
                this.stars = this.createStars();

                this.utils = new Utils(this.globe);
            },

            resetGlobe: function() {
                this.utils.resetFaces();
            },

            createGlobe: function() {
                return new THREE.Mesh(
                    new THREE.SphereGeometry(this.radius,
                                             this.widthAndHeight,
                                             this.widthAndHeight),
                    new THREE.MeshLambertMaterial({
                        shading: THREE.FlatShading,
                        side: THREE.DoubleSide,
                        vertexColors: THREE.FaceColors
                    })
                );
            },

            createOutlines: function() {
                return new THREE.Mesh(
                    new THREE.SphereGeometry(this.radius + 0.1,
                                             this.widthAndHeight,
                                             this.widthAndHeight),
                    new THREE.MeshLambertMaterial({
                        color: new THREE.Color(0x000000),
                        shading: THREE.FlatShading,
                        side: THREE.DoubleSide,
                        wireframe: true,
                        wireframeLineWidth: 2
                    })
                );
            },

            createStars: function() {
                var stars = [];
                var star;

                for (var i = 0; i < App.constants.stars.number; ++i) {
                    star = new THREE.Sprite(new THREE.SpriteMaterial());
                    star.position.x = App.constants.stars.initialX();
                    star.position.y = App.constants.stars.initialY();
                    star.position.z = App.constants.stars.initialZ();

                    star.position.normalize();
                    star.position.multiplyScalar(App.constants.stars.positionMultiplier());
                    star.scale.multiplyScalar(App.constants.stars.scaleMultiplier());
                    stars.push(star);
                }
                return stars;
            },

            addToScene: function() {
                scene.add(mesh.globe);
                if (App.debugging) {
                    scene.add(this.outlines);
                }
                _.map(mesh.stars, function(star) {
                    scene.add(star);
                });
            },

            toggleDebugging: function() {
                if (App.debugging) {
                    scene.remove(this.outlines);
                    App.debugging = false;
                } else {
                    scene.add(this.outlines);
                    App.debugging = true;
                }
            },

            update: function() {
                this.globe.geometry.colorsNeedUpdate = true;
            }
        };

        mesh.init();
        return mesh;
    };
});
