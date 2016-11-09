const { WebGLRenderer } = require('three');

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

module.exports = renderer;
