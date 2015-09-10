'use strict';

/* Adds methods useful in finding seed points for artists and
 * finding the nearest free face from a given face on the mesh
 */

let h = require('../helpers');
let Constants = require('../constants');
let Dispatch = require('../dispatch');
let THREE = require('three');
let scene = require('./scene');

class Globe extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);

        Dispatch.on('faces.*', payload => {
            this.updateFaces(JSON.parse(payload.faces));
        });
    }

    getFaceIndex(face) {
        return parseInt(Object.keys(face)[0], 10);
    }

    updateFaces(newFaces) {
        let oldFaces = this.geometry.faces;

        console.log('painting new faces:',
                    newFaces.map(face => this.getFaceIndex(face)));

        newFaces.forEach(face => {
            let index = this.getFaceIndex(face);
            oldFaces[index].color.copy(face[index].color);
            oldFaces[index].data = face[index].data;
        });

        this.geometry.colorsNeedUpdate = true;
    }

    addToScene() {
        scene.add(this);
    }

    faceCentroid(face) {
        // save deprecated face.centroid
        return new THREE.Vector3()
            .add(this.geometry.vertices[face.a])
            .add(this.geometry.vertices[face.b])
            .add(this.geometry.vertices[face.c])
            .divideScalar(3);
    }

    uniqueVerticesForEdges(edges) {
        // TODO: belongs here? use heds?
        return edges
            .map(e => [e.v1, e.v2])
            .reduce((a, b) => a.concat(b))
            .filter((e, i, es) => es.indexOf(e) === i);
    }

    resetGlobe() {
        // zero face values for fresh paint
        this.geometry.faces.map(f => {
            f.data = {};
            f.color.setHex(0xFFFFFF);
        });
        this.geometry.colorsNeedUpdate = true;
    }

    addEquidistantMarks(num) {
        if (this.markers && this.markers.length) {
            return this.markers;
        }
        this.markers = [];
        let mark;
        let points = h.equidistantishPointsOnSphere(num);

        for (let i in points) {
            mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
            mark.position.x = points[i][0];
            mark.position.y = points[i][1];
            mark.position.z = points[i][2];
            mark.position.multiplyScalar(this.geometry.parameters.radius + 2);
            this.markers.push(mark);
            scene.add(mark);
        }
    }

    findEquidistantFaces(numMarkers) {
        // add transient helper marks
        this.addEquidistantMarks(numMarkers);

        let caster = new THREE.Raycaster();
        let intersectingFaces = [];
        let marker;
        for (let i = 0; i < this.markers.length; i++) {
            // use the mark's vector as a ray to find the closest face
            // via its intersection
            marker = this.markers[i].position.clone();
            caster.set(this.position, marker.normalize());
            intersectingFaces.push(caster.intersectObject(this));
        }

        // clean up transient markers
        this.markers.map(mark => scene.remove(mark));
        delete this.markers;

        // return at most one face for each intersection
        return intersectingFaces.map(hit => hit[0]);
    }

    findClosestFace(candidates, target) {
        // compute the distance between each one of the candidates and
        // the target to find the closest candidate
        let closest, newDistance, lastDistance, targetCentroid;
        for (let i = 0; i < candidates.length; i++) {
            let faceVector = this.faceCentroid(candidates[i]).normalize();
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
    }

    findClosestFreeFace(startFace) {
        let freeFaces = this.geometry.faces.filter(f => !f.data.artist);
        return this.findClosestFace(freeFaces, startFace);
    }
}

module.exports = new Globe(
    new THREE.SphereGeometry(
        Constants.globe.radius,
        Constants.globe.widthAndHeight,
        Constants.globe.widthAndHeight
    ),
    new THREE.MeshLambertMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        vertexColors: THREE.FaceColors
    })
);
