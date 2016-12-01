const THREE = require('three');
const { light } = require('constants');
const scene = require('three/scene');

const create = () => scene.add(new THREE.AmbientLight(light.color));

module.exports = { create };
