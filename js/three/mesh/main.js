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

            makeTextSprite: function( message, parameters ) {
                if ( parameters === undefined ) parameters = {};

                var fontface = parameters.hasOwnProperty("fontface") ? 
                    parameters["fontface"] : "Arial";

                var fontsize = parameters.hasOwnProperty("fontsize") ? 
                    parameters["fontsize"] : 18;

                var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
                    parameters["borderThickness"] : 4;

                var borderColor = parameters.hasOwnProperty("borderColor") ?
                    parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

                var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                    parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                context.font = "Bold " + fontsize + "px " + fontface;

                // get size data (height depends only on font size)
                var metrics = context.measureText( message );
                var textWidth = metrics.width;

                // background color
                context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                    + backgroundColor.b + "," + backgroundColor.a + ")";
                // border color
                context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                    + borderColor.b + "," + borderColor.a + ")";
                context.lineWidth = borderThickness;
                this.roundRect(context, borderThickness/2, borderThickness/2,
                               textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
                // 1.4 is extra height factor for text below baseline: g,j,p,q.

                // text color
                context.fillStyle = "rgba(0, 0, 0, 1.0)";
                context.fillText( message, borderThickness, fontsize + borderThickness);

                // canvas contents will be used for a texture
                var texture = new THREE.Texture(canvas) 
                texture.needsUpdate = true;
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    useScreenCoordinates: false,
                    alignment: new THREE.Vector2( 0, 1 )
                });
                var sprite = new THREE.Sprite( spriteMaterial );
                sprite.scale.set(100,50,1.0);
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
                _.each(this.globe.geometry.vertices, function(vert) {
                    for (var i = 0; i < this.globe.geometry.vertices.length; i++) {
                        var spritey = this.makeTextSprite( " " + i + " ", {
                            fontsize: 32,
                            backgroundColor: {
                                r:255, g:100, b:100, a:1
                            }
                        });
                        spritey.position = this.globe.geometry.vertices[i].clone().multiplyScalar(1.1);
                        markers.push(spritey);
                    }
                }.bind(this));
                return markers;
            },

            createFaceMarkers: function() {
                var markers = [];
                _.each(this.globe.geometry.faces, function(face) {
                    for (var i = 0; i < this.globe.geometry.faces.length; i++) {
                        var spritey = this.makeTextSprite( " " + i + " ", {
                            fontsize: 32,
                            backgroundColor: {
                                r:100, g:100, b:255, a:1
                            }
                        });
                        spritey.position = this.globe.geometry.faces[i].centroid.clone().multiplyScalar(1.1);
                        markers.push(spritey);
                    }
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
