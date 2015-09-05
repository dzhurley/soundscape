'use strict';

let THREE = require('three');

module.exports = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    vertexColors: THREE.FaceColors
});
