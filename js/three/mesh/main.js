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
                this.vertexMarkers = this.createVertexMarkers();
                this.faceMarkers = this.createFaceMarkers();
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

            spriteDefaults: {
                'fontface': 'Inconsolata',
                'fontsize': '14',
                'borderThickness': '2',
                'borderColor': '#d7d7d7',
                'backgroundColor': '#272727'
            },

            makeTextSprite: function( message, parameters ) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                context.font = 'Bold ' + this.spriteDefaults.fontsize + 'px ' + this.spriteDefaults.fontface;

                // get size data (height depends only on font size)
                var metrics = context.measureText(message);
                var textWidth = metrics.width;

                context.fillStyle = this.spriteDefaults.backgroundColor;
                context.strokeStyle = this.spriteDefaults.borderColor;
                context.lineWidth = this.spriteDefaults.borderThickness;

                // 1.4 is extra height factor for text below baseline: g,j,p,q.
                this.roundRect(
                    context,
                    this.spriteDefaults.borderThickness / 2,
                    this.spriteDefaults.borderThickness / 2,
                    textWidth + this.spriteDefaults.borderThickness,
                    this.spriteDefaults.fontsize * 1.4 + this.spriteDefaults.borderThickness,
                    6
                );

                // text
                context.fillStyle = this.spriteDefaults.borderColor;
                context.fillText(
                    message,
                    this.spriteDefaults.borderThickness,
                    this.spriteDefaults.fontsize + this.spriteDefaults.borderThickness
                );

                // canvas contents will be used for a texture
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    useScreenCoordinates: false,
                    alignment: new THREE.Vector2( 0, 1 )
                });
                var sprite = new THREE.Sprite(spriteMaterial);
                return sprite;  
            },

            // function for drawing rounded rectangles
            roundRect: function(ctx, x, y, w, h, r) {
                ctx.beginPath();
                ctx.moveTo(x+r, y);
                ctx.lineTo(x+w-r, y);
                ctx.quadraticCurveTo(x+w, y, x+w, y+r);
                ctx.lineTo(x+w, y+h-r);
                ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
                ctx.lineTo(x+r, y+h);
                ctx.quadraticCurveTo(x, y+h, x, y+h-r);
                ctx.lineTo(x, y+r);
                ctx.quadraticCurveTo(x, y, x+r, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();   
            },

            createVertexMarkers: function() {
                var markers = [];
                _.each(this.globe.geometry.vertices, function(vertex, i) {
                    var spritey = this.makeTextSprite(' ' + i + ' ');
                    spritey.position = vertex.clone().multiplyScalar(1.1);
                    markers.push(spritey);
                }.bind(this));
                return markers;
            },

            createFaceMarkers: function() {
                var markers = [];
                _.each(this.globe.geometry.faces, function(face, i) {
                    var spritey = this.makeTextSprite(' ' + i + ' ');
                    spritey.position = face.centroid.clone().multiplyScalar(1.1);
                    markers.push(spritey);
                }.bind(this));
                return markers;
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
                    _.map(mesh.vertexMarkers, function(marker) {
                        scene.add(marker);
                    });
                    _.map(mesh.faceMarkers, function(marker) {
                        scene.add(marker);
                    });
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
