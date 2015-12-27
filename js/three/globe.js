'use strict';

/* Adds methods useful in finding seed points for artists and
 * finding the nearest free face from a given face on the mesh
 */

const { Mesh, MeshLambertMaterial, SphereGeometry } = require('three');

const constants = require('../constants');
const { on } = require('../dispatch');
const scene = require('./scene');
const { faceCentroid } = require('../helpers');

const { globe: { radius, widthAndHeight, shading, side, vertexColors } } = constants;

const globe = new Mesh(
    new SphereGeometry(radius, widthAndHeight, widthAndHeight),
    new MeshLambertMaterial({ shading, side, vertexColors })
);

// read

const faces = () => globe.geometry.faces;
const vertices = () => globe.geometry.vertices;

const addGlobe = () => scene.add(globe);

const resetGlobe = () => {
    // zero face values for fresh paint
    globe.geometry.faces.map(f => {
        f.data = {};
        f.color.setHex(0xFFFFFF);
    });
    globe.geometry.colorsNeedUpdate = true;
};

// TODO: use heds
const uniqueVerticesForEdges = edges => {
    return edges
        .map(e => [e.v1, e.v2])
        .reduce((a, b) => a.concat(b))
        .filter((e, i, es) => es.indexOf(e) === i);
};

const updateFaces = newFaces => {
    let oldFaces = globe.geometry.faces;

    let indices = newFaces.map(face => {
        let index = parseInt(Object.keys(face)[0], 10);
        oldFaces[index].color.copy(face[index].color);
        oldFaces[index].data = face[index].data;
        return index;
    });
    console.log('painting new faces:', indices);

    globe.geometry.colorsNeedUpdate = true;
};

// TODO: move to swapper?
// compute the distance between each one of the candidates and the target
// to find the closest candidate
const findClosestFace = (candidates, target) => {
    let closest, newDistance, lastDistance, targetCentroid;
    for (let i = 0; i < candidates.length; i++) {
        let faceVector = faceCentroid(globe, candidates[i]).normalize();
        targetCentroid = faceCentroid(globe, target).normalize();
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
};

// TODO: move to swapper?
const findClosestFreeFace = startFace => {
    return findClosestFace(globe.geometry.faces.filter(f => !f.data.artist), startFace);
};

const markForUpdate = () => globe.geometry.colorsNeedUpdate = true;

on('faces.*', ({ faces }) => updateFaces(JSON.parse(faces)));

module.exports = {
    // extension
    addGlobe,
    uniqueVerticesForEdges,
    findClosestFreeFace,
    findClosestFace,
    resetGlobe,
    markForUpdate,

    // TODO: better accessors
    globe,
    geometry: globe.geometry,
    position: globe.position,
    faces,
    vertices
};
