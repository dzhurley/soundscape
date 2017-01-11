// Main globe for display and interaction

const THREE = require('three');

const { emit, on } = require('dispatch');
const constants = require('constants');
const scene = require('three/scene');
const { sink } = require('three/seeds');

const {
    globe: {
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
const defaultFaces = () => {
    globe.geometry.faces.map(f => {
        const channel = Math.random();
        f.color.setRGB(channel, channel, channel);
        f.data = {};
    });
};

// update pending faces with info painted in worker
const paint = pending => {
    pending.map(update => {
        const face = globe.geometry.faces[update.index];
        const { r, g, b } = update.color;
        face.color.setRGB(r, g, b);
        face.data = update.data;
    });
    globe.geometry.colorsNeedUpdate = true;
};

const create = () => {
    let prestine = true;
    on('submitted', () => {
        if (prestine) {
            prestine = false;
            return;
        }
        // clear the globe on each form submit for a new user's artists
        globe.geometry.faces.map(f => f.data = {});
    });

    // coordinate with sinking seeds animation to paint faces
    on('paint', pending => sink(pending[0].data.artist, () => paint(pending)));

    on('gaps', pending => {
        paint(pending);
        emit('painted');
    });

    defaultFaces();
    scene.add(globe);
};

module.exports = { create, globe };
