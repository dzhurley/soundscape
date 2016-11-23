const THREE = require('three');

const constants = require('constants');
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

const addGlobe = () => scene.add(globe);
const resetGlobe = () => {
    globe.geometry.faces.map(f => {
        f.data = {};
        f.color.setHex(defaultFaceColor);
    });
    globe.geometry.colorsNeedUpdate = true;
};

module.exports = { addGlobe, resetGlobe, globe };
