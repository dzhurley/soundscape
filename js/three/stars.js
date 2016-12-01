const THREE = require('three');
const { stars } = require('constants');
const scene = require('three/scene');

const { number, x, y, z, positionMultiplier, scaleMultiplier } = stars;

let field = new THREE.Group();

const create = () => {
    let star;
    for (let i = 0; i < number; ++i) {
        star = new THREE.Sprite(new THREE.SpriteMaterial());
        star.position.set(x(), y(), z());
        star.position.normalize();
        star.position.multiplyScalar(positionMultiplier());
        star.scale.multiplyScalar(scaleMultiplier());
        field.add(star);
    }
    scene.add(field);
};

module.exports = { create };
