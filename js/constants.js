const THREE = require('three');

const camera = Object.freeze({
    position: { x: 500, y: 500, z: 500 },
    fov: 75,
    aspect() {
        // needs to be callable as constants are used in workers, which don't have window
        return window.innerWidth / window.innerHeight;
    },
    near: 0.1,
    far: 10000
});

const events = Object.freeze([
    // on form submission
    'submitting',
    // on POST to data source
    'submitted',

    // ui event
    'toggleControls',

    // data events to be used in worker
    'seed',
    'seeded'
]);

const flyControls = Object.freeze({
    autoForward: false,
    dragToLook: true,
    movementSpeed: 1,
    rollSpeed: 0.03
});

const force = Object.freeze({
    epsilon: 0.000001,
    maxIterations: 100000,
    initialTemp: 1000
});

const globe = Object.freeze({
    axisSize: 800,
    defaultFaceColor: 0xFFFFFF,
    radius: 300,
    widthAndHeight: 100,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    vertexColors: THREE.FaceColors
});

const light = Object.freeze({ color: 0xf0f0f0 });

const node = Object.freeze({
    geometry: new THREE.SphereGeometry(10, 25, 25),
    material(color) {
        return new THREE.MeshBasicMaterial({ color });
    }
});

const orbitalControls = Object.freeze({
    zoomSpeed: 0.2,
    rotateSpeed: 0.5,
    noKeys: true,
    maxDistance: 1500
});

const sources = ['lastfm'];

const stars = Object.freeze({
    number: 1000,
    x() {
        return Math.random() * 2 - 1;
    },
    y() {
        return Math.random() * 2 - 1;
    },
    z() {
        return Math.random() * 2 - 1;
    },
    positionMultiplier() {
        return Math.random() * 100 + 1000;
    },
    scaleMultiplier() {
        return Math.random() * 10;
    }
});

module.exports = Object.freeze({
    camera,
    events,
    flyControls,
    force,
    globe,
    light,
    node,
    orbitalControls,
    sources,
    stars
});
