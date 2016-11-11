/* Adds methods useful in finding seed points for artists and
 * finding the nearest free face from a given face on the mesh
 */

const THREE = require('three');

const constants = require('constants');
const { on } = require('dispatch');
const scene = require('three/scene');

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

const globe = new THREE.Mesh(
    new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight),
    new THREE.MeshLambertMaterial({ shading, side, vertexColors })
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

const updateFaces = ({ faces }) => {
    const newFaces = JSON.parse(faces);
    let oldFaces = geometry().faces;

    let indices = newFaces.map(face => {
        let index = parseInt(Object.keys(face)[0], 10);
        oldFaces[index].color.set(face[index].color);
        oldFaces[index].data = face[index].data;
        return index;
    });
    console.log('painting new faces:', indices);

    markForUpdate();
};


on('faces.seeded', updateFaces);
on('faces.painted', updateFaces);

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
