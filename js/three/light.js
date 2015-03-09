var THREE = require('three');
var scene = require('./scene');

var light = {
    ambient: new THREE.AmbientLight(0xf0f0f0),

    addToScene: function() {
        scene.add(light.ambient);
    }
};

module.exports = light;
