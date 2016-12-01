const THREE = require('three');

const { emit, on } = require('dispatch');
const constants = require('constants');
const scene = require('three/scene');
const { sink } = require('three/seeds');

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

const paint = pending => {
    pending.map(update => {
        const face = globe.geometry.faces[update.index];
        const { r, g, b } = update.color;
        face.color.setRGB(r, g, b);
        face.data = update.data;
    });
    globe.geometry.colorsNeedUpdate = true;
};

const reset = () => {
    globe.geometry.faces.map(f => {
        f.data = {};
        f.color.setHex(defaultFaceColor);
    });
    globe.geometry.colorsNeedUpdate = true;
};

const create = () => {
    on('submitted', reset);
    on('paint', pending => sink(pending[0].data.artist, () => paint(pending)));
    on('gaps', pending => {
        paint(pending);
        emit('painted');
    });

    scene.add(globe);
};

module.exports = { create, globe };
