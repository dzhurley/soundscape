define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function() {
        var headsUp = {
            template: _.template("<span><%= artist %>, played <%= plays %> time(s)</span>"),
            mouse: { x: 0, y: 0 },

            init: function() {
                this.active = null;
                this.showing = false;
                this.projector = new THREE.Projector();

                App.container.addEventListener('click', function(evt) {
                    if (evt.target.nodeName === 'BUTTON') {
                        return false;
                    }
                    this.updateMouse(evt);
                    this.updateActive();
                }.bind(this));
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
                    return;
                }

                var face = intersects[0].face;
                if (face != this.active) {
                    this.active = face;
                }

                if (face.data && face.data.artist) {
                    data = _.extend({}, this.active.data);
                    App.headsUpDisplay.innerHTML = this.template(data);
                    App.headsUpDisplay.style.display = 'block';
                } else {
                    App.headsUpDisplay.style.display = 'none';
                }
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
            }
        };

        headsUp.init();
        return headsUp;
    };
});
