'use strict';

/* Adds methods useful in finding seed points for artists and
 * finding the nearest free face from a given face on the mesh
 */

const { globe } = require('../constants');
const { on } = require('../dispatch');
const THREE = require('three');
const scene = require('./scene');

class Globe extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);

        on('faces.*', payload => this.updateFaces(JSON.parse(payload.faces)));
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
    new THREE.SphereGeometry(globe.radius, globe.widthAndHeight, globe.widthAndHeight),
    new THREE.MeshLambertMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        vertexColors: THREE.FaceColors
    })
);
