'use strict';

let THREE = require('three');
let Constants = require('../constants');
let scene = require('./scene');

let stars = [];
let star;

for (let i = 0; i < Constants.stars.number; ++i) {
    star = new THREE.Sprite(new THREE.SpriteMaterial());
    star.position.x = Constants.stars.initialX();
    star.position.y = Constants.stars.initialY();
    star.position.z = Constants.stars.initialZ();

    star.position.normalize();
    star.position.multiplyScalar(Constants.stars.positionMultiplier());
    star.scale.multiplyScalar(Constants.stars.scaleMultiplier());
    stars.push(star);
}

module.exports = {
    addToScene() {
        stars.map(star => scene.add(star));
    }
};
