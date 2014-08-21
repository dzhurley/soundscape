define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function() {
        var projector = new THREE.Projector();
        var mouse = { x: 0, y: 0 };
        var active;

        var updateMouse = function(evt) {
            mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
        };

        var findIntersects = function() {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, App.three.camera);
            var ray = new THREE.Raycaster(App.three.camera.position,
                                          vector.sub(App.three.camera.position).normalize());
            return ray.intersectObjects([App.three.mesh.globe]);
        };

        var headsUp = {
            bindHeadsUp: function() {
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
                    active = null;
                    return;
                }

                var face = intersects[0].face;
                if (face.data && face.data.artist) {
                    this.showArtist(face.data.artist);
                }

                if (face != active) {
                    active = face;

                    data = _.extend({}, active.data, {
                        'face a': active.a,
                        'face b': active.b,
                        'face c': active.c,
                        'valid a': App.three.mesh.edger.generalVert(active.a),
                        'valid b': App.three.mesh.edger.generalVert(active.b),
                        'valid c': App.three.mesh.edger.generalVert(active.c)
                    });

                    if(data) {
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
                // TODO: double click race sets orange permanently
                var faces = _.filter(App.processor.facer.faces, function(choice) {
                    return choice.data.artist === name;
                });

                if (faces.length) {
                    var savedColor = _.clone(faces[0].color);

                    _.map(faces, function(face) {
                        face.color = new THREE.Color(0xffa500);
                    });
                    App.three.mesh.update();

                    setTimeout(function(faces, savedColor) {
                        _.map(faces, function(face) {
                            face.color = savedColor;
                        });
                        App.three.mesh.update();
                    }, 250, faces, savedColor);
                }
            }
        };

        headsUp.bindHeadsUp();
        return headsUp;
    };
});
