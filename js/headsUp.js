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
                this.activeMarkers = [];

                App.container.addEventListener('click', function(evt) {
                    // TODO: play with hover instead
                    if (evt.target.nodeName === 'BUTTON') {
                        return false;
                    }
                    this.updateMouse(evt);
                    this.updateActive();
                }.bind(this));

                App.vent.on('debugging', function(evt, debugging) {
                    if (!debugging) {
                        return this.removeMarkers();
                    }
                }.bind(this));
            },

            removeMarkers: function() {
                _.each(this.activeMarkers, function(mark) {
                    scene.remove(mark);
                });
                this.activeMarkers = [];
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

                    if (App.debugging) {
                        this.removeMarkers();
                        // TODO: mark artist territory instead of only one face
                        this.addVertexMarkers(face);
                        this.addFaceMarkers(face);
                    }
                }

                if (face.data && face.data.artist) {
                    data = _.extend({}, this.active.data);
                    App.headsUpDisplay.innerHTML = this.template(data);
                    App.headsUpDisplay.style.display = 'block';
                } else {
                    App.headsUpDisplay.style.display = 'none';
                }
            },

            addVertexMarkers: function(face) {
                var mesh = App.three.mesh;
                var mark, generalVert, vertex;
                _.each([face.a, face.b, face.c], function(index) {
                    vertex = mesh.globe.geometry.vertices[index];
                    generalIndices = mesh.utils.generalVert(vertex);
                    mark = this.makeMark(JSON.stringify(generalIndices));
                    mark.position = vertex.clone().multiplyScalar(1.005);
                    this.activeMarkers.push(mark);
                    scene.add(mark);
                }.bind(this));
            },

            addFaceMarkers: function(face) {
                var mark = this.makeMark(App.three.mesh.globe.geometry.faces.indexOf(face));
                mark.position = face.centroid.clone().multiplyScalar(1.005);
                this.activeMarkers.push(mark);
                scene.add(mark);
            },

            // TODO: push into constants.js, along with other relevant info to make tips
            markDefaults: {
                'backgroundColor': '#272727',
                'color': '#d7d7d7',
                'fontface': 'Inconsolata',
                'fontsize': '400'
            },

            getMarkProp: function(key) {
                var value = this.markDefaults[key];
                // if the value is a string, return it, otherwise return
                // the number as an integer
                return isNaN(value) ? value : +value;
            },

            makeMark: function(message) {
                var canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1600;
                var context = canvas.getContext('2d');

                var backgroundColor = this.getMarkProp('backgroundColor');
                var color = this.getMarkProp('color');
                var fontface = this.getMarkProp('fontface');
                var fontsize = this.getMarkProp('fontsize');

                context.font = fontsize + 'px ' + fontface;

                var textWidth  = context.measureText(message).width;
                if (textWidth > canvas.width) {
                    canvas.width = canvas.height = textWidth;
                    context = canvas.getContext('2d');
                    context.font = fontsize + 'px ' + fontface;
                }

                context.fillStyle = backgroundColor;
                context.fillRect(
                    0,
                    canvas.height / 2 - fontsize * 1.3,
                    canvas.width,
                    canvas.height / 2
                );

                context.fillStyle = color;
                context.textAlign = 'center';
                context.fillText(message, canvas.width / 2, canvas.height / 2);

                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
            }
        };

        headsUp.init();
        return headsUp;
    };
});
