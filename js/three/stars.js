const { Sprite, SpriteMaterial } = require('three');
const { stars } = require('../constants');
const scene = require('./scene');

const { number, x, y, z, positionMultiplier, scaleMultiplier } = stars;
let field = [];
let star;

for (let i = 0; i < number; ++i) {
    star = new Sprite(new SpriteMaterial());
    star.position.set(x(), y(), z());
    star.position.normalize();
    star.position.multiplyScalar(positionMultiplier());
    star.scale.multiplyScalar(scaleMultiplier());
    field.push(star);
}

const addStars = () => field.map(star => scene.add(star));

module.exports = { addStars };
