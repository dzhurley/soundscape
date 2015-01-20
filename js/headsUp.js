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
                this.activeMarkers = [];

                App.container.addEventListener('click', function(evt) {
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
                vector.unproject(App.three.camera);
                var position = App.three.camera.position;
                var ray = new THREE.Raycaster(position, vector.sub(position).normalize());
                return ray.intersectObject(App.three.mesh.globe);
            },

            updateActive: function() {
                var intersects = this.findIntersects();
                var data, faces, vertices, edges;

                if (intersects.length === 0) {
                    this.active = null;
                    return;
                }

                var face = intersects[0].face;
                var isPainted = face.data && face.data.artist;
                if (face != this.active) {
                    this.active = face;

                    if (App.debugging) {
                        this.removeMarkers();

                        if (isPainted) {
                            // Really the best way?
                            edges = App.plotter.postMessage({
                                msg: 'edgesForArtist',
                                artistName: this.active.data.artist
                            });

                            faces = _.filter(App.three.mesh.globe.geometry.faces, function(face) {
                                return face.data.artist === this.active.data.artist;
                            }.bind(this));
                            for (var i in faces) {
                                this.addFaceMarkers(faces[i]);
                            }
                        } else {
                            this.addVertexMarkers([face.a, face.b, face.c]);
                            this.addFaceMarkers(face);
                        }
                    }
                }

                if (isPainted) {
                    data = _.extend({}, this.active.data);
                    App.headsUpDisplay.innerHTML = this.template(data);
                    App.headsUpDisplay.style.display = 'block';
                } else {
                    App.headsUpDisplay.style.display = 'none';
                }
            },

            setVerticesFromArtistEdges: function(edges) {
                vertices = App.three.mesh.utils.uniqueVerticesForEdges(edges);
                this.addVertexMarkers(vertices);
            },

            addVertexMarkers: function(vertices) {
                var mesh = App.three.mesh;
                var mark, generalVert, vertex;
                _.each(vertices, function(index) {
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
                mark.position = new THREE.Vector3()
                    .addVectors(face.a, face.b, face.c)
                    .divideScalar(3)
                    .multiplyScalar(1.005);
                this.activeMarkers.push(mark);
                scene.add(mark);
            },

            getMarkProp: function(key) {
                var value = App.constants.labels[key];
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
