'use strict';

let THREE = require('three');
let Constants = require('../../constants');

module.exports = new THREE.SphereGeometry(
    Constants.globe.radius,
    Constants.globe.widthAndHeight,
    Constants.globe.widthAndHeight
);
