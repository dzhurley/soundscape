define([
    'underscore',
    'threejs',
    'three/scene'
], function(_, THREE, scene) {
    return function() {
        var headsUp = {
            template: _.template("<span><%= artist %>, played <%= plays %> time(s)</span>"),
            mouse: { x: 0, y: 0 },

            init: function() {
                this.active = null;
                this.showing = false;
                this.projector = new THREE.Projector();
                this.activeVertices = [];
                this.activeFaces = [];

                App.container.addEventListener('click', function(evt) {
                    if (evt.target.nodeName === 'BUTTON') {
                        return false;
                    }
                    this.updateMouse(evt);
                    this.updateActive();
                }.bind(this));

                App.vent.on('debugging', function(evt, debugging) {
                    if (debugging) {
                        return this.removeMarkers();
                    }
                }.bind(this));
            },

            removeMarkers: function() {
                _.each(this.activeVertices, function(vertex) {
                    scene.remove(vertex);
                });
                _.each(this.activeFaces, function(face) {
                    scene.remove(face);
                });
                this.activeVertices = [];
                this.activeFaces = [];
            },

            updateMouse: function(evt) {
                this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
            },

            findIntersects: function() {
                var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
                this.projector.unprojectVector(vector, App.three.camera);
                var position = App.three.camera.position;
                var ray = new THREE.Raycaster(position, vector.sub(position).normalize());
                return ray.intersectObject(App.three.mesh.globe);
            },

            updateActive: function() {
                var intersects = this.findIntersects();
                var data;

                if (intersects.length === 0) {
                    this.active = null;
                    this.removeMarkers();
                    return;
                }

                var face = intersects[0].face;
                if (face != this.active) {
                    this.active = face;
                    _.each([face.a, face.b, face.c], function(index) {
                        return this.activeVertices.push(
                            App.three.mesh.globe.geometry.vertices[index]
                        );
                    }.bind(this));
                    this.activeFaces.push(face);

                    this.addVertexMarkers();
                    this.addFaceMarkers();
                }

                if (face.data && face.data.artist) {
                    data = _.extend({}, this.active.data);
                    App.headsUpDisplay.innerHTML = this.template(data);
                    App.headsUpDisplay.style.display = 'block';
                } else {
                    App.headsUpDisplay.style.display = 'none';
                }
            },

            addVertexMarkers: function() {
                _.each(this.activeVertices, function(vertex) {
                    var spritey = this.makeTextSprite(
                        ' ' + App.three.mesh.globe.geometry.vertices.indexOf(vertex) + ' '
                    );
                    spritey.position = vertex.clone().multiplyScalar(1.005);
                    scene.add(spritey);
                }.bind(this));
            },

            addFaceMarkers: function() {
                _.each(this.activeFaces, function(face, i) {
                    var spritey = this.makeTextSprite(
                        ' ' + App.three.mesh.globe.geometry.faces.indexOf(face) + ' '
                    );
                    spritey.position = face.centroid.clone().multiplyScalar(1.005);
                    scene.add(spritey);
                }.bind(this));
            },

            // TODO: push into constants.js, along with other relevant info to make tips
            spriteDefaults: {
                'fontface': 'Inconsolata',
                'fontsize': '14',
                'borderThickness': '2',
                'borderColor': '#d7d7d7',
                'backgroundColor': '#272727'
            },

            makeTextSprite: function(message) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                context.font = this.spriteDefaults.fontsize + 'px ' + this.spriteDefaults.fontface;

                // get size data (height depends only on font size)
                var metrics = context.measureText(message);
                var textWidth = metrics.width;

                context.fillStyle = this.spriteDefaults.backgroundColor;
                context.strokeStyle = this.spriteDefaults.borderColor;
                context.lineWidth = this.spriteDefaults.borderThickness;

                var xAndY = this.spriteDefaults.borderThickness / 2;
                var width = textWidth + this.spriteDefaults.borderThickness;
                // 1.4 is extra height factor for text below baseline: g,j,p,q.
                var height = (
                    this.spriteDefaults.fontsize * 1.1 + this.spriteDefaults.borderThickness
                );
                context.fillRect(xAndY, xAndY, xAndY + width, xAndY + height);

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

            roundRect: function(ctx, x, y, w, h) {
            }
        };

        headsUp.init();
        return headsUp;
    };
});
