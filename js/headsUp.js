define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function() {
        var projector = new THREE.Projector();
        var mouse = { x: 0, y: 0 };

        var updateMouse = function(evt) {
            mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
        };

        var findIntersects = function() {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, App.three.camera);
            var position = App.three.camera.position;
            var ray = new THREE.Raycaster(position, vector.sub(position).normalize());
            return ray.intersectObject(App.three.mesh.globe);
        };

        var headsUp = {
            bindHeadsUp: function() {
                this.active = null;
                this.showing = false;

                App.container.addEventListener('click', _.bind(function(evt) {
                    if (evt.target.nodeName === 'BUTTON') {
                        return false;
                    }
                    updateMouse(evt);
                    var intersects = findIntersects();
                    this.updateActive(intersects);
                }, this));
            },

            updateActive: function(intersects) {
                var data;
                if (intersects.length === 0) {
                    this.active = null;
                    return;
                }

                var face = intersects[0].face;
                if (face.data && face.data.artist) {
                    // TODO:dh revisit when more need for delayed ux comes into play
                    // this.showArtist(face.data.artist);
                }

                if (face != this.active) {
                    this.active = face;

                    data = _.extend({}, this.active.data, {
                        'index': App.three.mesh.globe.geometry.faces.indexOf(this.active),
                        'face a': this.active.a,
                        'valid a': App.three.mesh.edger.generalVert(this.active.a),
                        'face b': this.active.b,
                        'valid b': App.three.mesh.edger.generalVert(this.active.b),
                        'face c': this.active.c,
                        'valid c': App.three.mesh.edger.generalVert(this.active.c)
                    });

                    if (data) {
                        var html = '';
                        _.each(_.keys(data), function(key) {
                            var val = data[key];
                            if (_.isObject(val)) {
                                val = JSON.stringify(val);
                            }
                            html += '<span>' + key + ': ' + val + '</span>';
                        });
                        App.headsUpDisplay.innerHTML = html;
                    }
                }
            },

            showArtist: function(name) {
                // pulse an artist's territory orange for .25 seconds
                var faces = _.filter(App.plotter.facer.faces, function(choice) {
                    return choice.data.artist === name;
                });

                if (faces.length && !this.showing) {
                    this.showing = true;
                    var savedColor = _.clone(faces[0].color);

                    _.map(faces, function(face) {
                        face.color = new THREE.Color(0xffa500);
                    });
                    App.three.mesh.update();

                    setTimeout(_.bind(function(faces, savedColor) {
                        _.map(faces, function(face) {
                            face.color = savedColor;
                        });
                        App.three.mesh.update();
                        this.showing = false;
                    }, this), 250, faces, savedColor);
                }
            }
        };

        headsUp.bindHeadsUp();
        return headsUp;
    };
});
