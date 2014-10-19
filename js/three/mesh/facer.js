define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene'
], function(_, h, THREE, scene) {
    return function(mesh) {
        var Facer = {
            mesh: mesh,

            resetFaces: function() {
                // zero face values for fresh paint
                _.map(this.mesh.geometry.faces, function(f) {
                    f.data = {};
                    f.color.setHex(0xFFFFFF);
                });
                App.three.mesh.update();
            },

            addEquidistantMarks: function(num) {
                if (this.markers && this.markers.length) {
                    // TODO: check on scene addition/removal?
                    return this.markers;
                }
                this.markers = [];
                var mark;
                var points = h.equidistantishPointsOnSphere(num);

                for (var i in points) {
                    mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
                    mark.position.x = points[i][0];
                    mark.position.y = points[i][1];
                    mark.position.z = points[i][2];
                    mark.position.multiplyScalar(this.mesh.geometry.radius + 2);
                    this.markers.push(mark);
                    scene.add(mark);
                }
            },

            findEquidistantFaces: function(numMarkers) {
                // add transient helper marks
                this.addEquidistantMarks(numMarkers);

                var caster = new THREE.Raycaster();
                var intersectingFaces = [];
                var marker;
                for (var i = 0; i < this.markers.length; i++) {
                    // use the mark's vector as a ray to find the closest face
                    // via its intersection
                    marker = this.markers[i].position.clone();
                    caster.set(this.mesh.position, marker.normalize());
                    intersectingFaces.push(caster.intersectObject(this.mesh));
                }

                // clean up transient markers
                _.each(this.markers, function(mark) {
                    scene.remove(mark);
                });
                delete this.markers;

                return _.map(intersectingFaces, function(hit) {
                    // return at most one face for each intersection
                    return hit[0];
                });
            },

            findClosestFreeFace: function(startFace) {
                // compute the distance between each one of the free faces and
                // startFace to find the closest free face
                var freeFaces = _.filter(this.mesh.geometry.faces, function(f) {
                    return !f.data.artist;
                });

                var closestFreeFace, newDistance, lastDistance;
                for (var i = 0; i < freeFaces.length; i++) {
                    faceVector = freeFaces[i].centroid.normalize();
                    newDistance = startFace.centroid.normalize().distanceTo(faceVector);
                    if (!closestFreeFace) {
                        closestFreeFace = freeFaces[i];
                        lastDistance = newDistance;
                    } else if (newDistance < lastDistance) {
                        closestFreeFace = freeFaces[i];
                        lastDistance = newDistance;
                    }
                }

                return closestFreeFace;
            },

            handleSwappers: function(startFace) {
                var closest = this.findClosestFreeFace(startFace);
            }
        };

        return Facer;
    };
});
