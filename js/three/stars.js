'use strict';

const THREE = require('three');
const { stars } = require('../constants');
const scene = require('./scene');

let { number, x, y, z, positionMultiplier, scaleMultiplier } = stars;
let field = [];
let star;

for (let i = 0; i < number; ++i) {
    star = new THREE.Sprite(new THREE.SpriteMaterial());
    star.position.set(x(), y(), z());
    star.position.normalize();
    star.position.multiplyScalar(positionMultiplier());
    star.scale.multiplyScalar(scaleMultiplier());
    field.push(star);
}

module.exports = {
    addStars() {
        field.map(star => scene.add(star));
    }
};
