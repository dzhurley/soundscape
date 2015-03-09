var _ = require('underscore');
var h = require('../../helpers');
var THREE = require('three');
var scene = require('../scene');

var Utils = function(mesh) {
    this.geo = mesh.geometry;
    this.mesh = mesh;
};

_.extend(Utils, {
    faceCentroid: function(face) {
        // save deprecated face.centroid
        return new THREE.Vector3()
        .add(this.geo.vertices[face.a])
        .add(this.geo.vertices[face.b])
        .add(this.geo.vertices[face.c])
        .divideScalar(3);
    },

    uniqueVerticesForEdges: function(edges) {
        return _.uniq(_.flatten(_.map(edges, function(edge) {
            return [edge.v1, edge.v2];
        })));
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
    }
});

module.exports = Utils;
