const THREE = require('three');

const { emit, on } = require('dispatch');
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

const paint = pending => {
    pending.map(update => {
        const face = globe.geometry.faces[update.index];
        const { r, g, b } = update.color;
        face.color.setRGB(r, g, b);
        face.data = update.data;
    });
    globe.geometry.colorsNeedUpdate = true;
};

on('paint', paint);
on('gaps', pending => {
    paint(pending);
    emit('painted');
});

module.exports = { addGlobe, resetGlobe, globe };
