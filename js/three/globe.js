/* Adds methods useful in finding seed points for artists and
 * finding the nearest free face from a given face on the mesh
 */

const { Mesh, MeshLambertMaterial, SphereGeometry } = require('three');

const constants = require('../constants');
const { emitOnWorker, on } = require('../dispatch');
const { isActive } = require('../labs');
const scene = require('./scene');

const {
    globe: {
        defaultFaceColor,
        radius,
        widthAndHeight,
        shading,
        side,
        vertexColors
    }
} = constants;

const globe = new Mesh(
    new SphereGeometry(radius, widthAndHeight, widthAndHeight),
    new MeshLambertMaterial({ shading, side, vertexColors })
);

// read

const geometry = () => globe.geometry;
const position = () => globe.position;
const faces = () => geometry().faces;
const vertices = () => geometry().vertices;

const markForUpdate = () => globe.geometry.colorsNeedUpdate = true;

const addGlobe = () => scene.add(globe);

const resetGlobe = () => {
    faces().map(f => {
        f.data = {};
        f.color.setHex(defaultFaceColor);
    });
    markForUpdate();

    // forceSeeding specific
    scene.children.filter(c => c.charge).map(c => scene.remove(c));
};

const updateFaces = newFaces => {
    let oldFaces = faces();

    let indices = newFaces.map(face => {
        let index = parseInt(Object.keys(face)[0], 10);
        oldFaces[index].color.copy(face[index].color);
        oldFaces[index].data = face[index].data;
        return index;
    });
    console.log('painting new faces:', indices);

    markForUpdate();
};

on('faces.seeded', ({ faces }) => {
    updateFaces(JSON.parse(faces));
    if (!isActive('iterateControl')) emitOnWorker('plot.all');
});
on('faces.painted', ({ faces }) => updateFaces(JSON.parse(faces)));

module.exports = {
    // extension
    addGlobe,
    resetGlobe,
    markForUpdate,

    // object
    globe,
    geometry,
    position,
    faces,
    vertices
};
