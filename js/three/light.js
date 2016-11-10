const THREE = require('three');
const { light } = require('constants');
const scene = require('three/scene');

const addLight = () => scene.add(new THREE.AmbientLight(light.color));

module.exports = { addLight };
