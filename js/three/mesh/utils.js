define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene'
], function(_, h, THREE, scene) {
    return function(mesh) {
        var Utils = {
            geo: mesh.geometry,
            mesh: mesh,

            init: function() {
                // make sure we don't have to deal with duplicate pole/seam vertices
                this.geo.mergeVertices();
            },

            generalVert: function(vert) {
                if (!_.isNumber(vert)) {
                    // we got a vertex, not an index
                    vert = this.geo.vertices.indexOf(vert);
                }
                return [vert];
            },

            generalEdge: function(edge) {
                return {v1: [edge.v1], v2: [edge.v2]};
            },

            sameEdge: function(first, second) {
                if (_.isEqual(first.v1, second.v1)) {
                    return _.isEqual(first.v2, second.v2);
                } else if (_.isEqual(first.v1, second.v2)) {
                    return _.isEqual(first.v2, second.v1);
                }
                return false;
            },

            uniqueVerticesForEdges: function(edges) {
                return _.uniq(_.flatten(_.map(edges, function(edge) {
                    return [edge.v1, edge.v2];
                })));
            },

            facesForEdge: function(edge) {
                return _.filter(this.geo.faces, function(face) {
                    if (this.sameEdge(edge, {v1: face.a, v2: face.b})) {
                        return true;
                    } else if (this.sameEdge(edge, {v1: face.a, v2: face.c})) {
                        return true;
                    } else if (this.sameEdge(edge, {v1: face.b, v2: face.c})) {
                        return true;
                    }
                    return false;
                }.bind(this), edge);
            },

            removeEdge: function(edges, edge) {
                // remove an edge from a set of edges
                var verts = this.generalEdge(edge);
                var match = _.find(edges, function(e) {
                    return _.contains(verts.v1, e.v1) && _.contains(verts.v2, e.v2);
                });

                if (match) {
                    edges.splice(edges.indexOf(match), 1);
                } else {
                    match = _.find(edges, function(e) {
                        return _.contains(verts.v1, e.v2) && _.contains(verts.v2, e.v1);
                    });
                    if (match) {
                        edges.splice(edges.indexOf(match), 1);
                    }
                }
            },

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
                    mark.position.multiplyScalar(this.mesh.geometry.parameters.radius + 2);
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

            faceCentroid: function(face) {
                return new THREE.Vector3()
                    .addVectors(face.a, face.b, face.c)
                    .divideScalar(3);
            },

            findClosestFace: function(candidates, target) {
                // compute the distance between each one of the candidates and
                // the target to find the closest candidate
                var closest, newDistance, lastDistance, targetCentroid;
                for (var i = 0; i < candidates.length; i++) {
                    faceVector = this.faceCentroid(candidates[i]).normalize();
                    targetCentroid = this.faceCentroid(target).normalize();
                    newDistance = targetCentroid.distanceTo(faceVector);
                    if (!closest) {
                        closest = candidates[i];
                        lastDistance = newDistance;
                    } else if (newDistance < lastDistance) {
                        closest = candidates[i];
                        lastDistance = newDistance;
                    }
                }
                return closest;
            },

            findClosestFreeFace: function(startFace) {
                var freeFaces = _.filter(this.mesh.geometry.faces, function(f) {
                    return !f.data.artist;
                });
                return this.findClosestFace(freeFaces, startFace);
            },

            adjacentFaces: function(face) {
                var faces = [];
                var edges = [
                    { v1: face.a, v2: face.b },
                    { v1: face.b, v2: face.c },
                    { v1: face.c, v2: face.a }
                ];

                _.each(edges, function(edge) {
                    faces.push(_.without(this.facesForEdge(edge), face));
                }.bind(this));
                return _.flatten(faces);
            }
        };

        Utils.init();
        return Utils;
    };
});
