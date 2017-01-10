// App-wide (main and worker threads) location for numbers, strings, and other
// constants that could get lost in deeply nested files somewhere.
//
// Functions are needed to either generate a new instance each use, to facilitate
// sharing in workers that don't have access to window, or rely on other constants
// at runtime.
const THREE = require('three');

const camera = {
    position: { x: 500, y: 500, z: 500 },
    fov: 75,
    aspect() {
        return window.innerWidth / window.innerHeight;
    },
    near: 0.1,
    far: 10000
};

const events = [
    // on form submission
    'submitting',
    // on POST to data source
    'submitted',

    // ui event
    'controls',

    // artist info is ready for the globe
    'seed',

    // forces have finished
    'seeded',

    // faces of globe need painting
    'paint',

    // final faces need painting
    'gaps',

    // globe is covered
    'painted'
];

const flyControls = {
    autoForward: false,
    dragToLook: true,
    movementSpeed: 1,
    rollSpeed: 0.03
};

const force = {
    epsilon: 0.00001,

    // help normalize charge values on nodes before force iteration
    globeDivisor: 1.5,

    initialTemp: 1000,
    maxIterations: 10000
};

const globe = {
    axisSize: 800,
    defaultFaceColor: 0xFFFFFF,

    // max number of faces to send from worker to main for painting at a time
    pendingFaceChunk: 5000,

    radius: 300,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    widthAndHeight: 300,
    vertexColors: THREE.FaceColors
};

const light = { color: 0xf0f0f0 };

const node = {
    geometry() {
        return new THREE.SphereBufferGeometry(node.radius, 3, 2);
    },
    material(color) {
        return new THREE.MeshBasicMaterial({ color });
    },
    radius: 15
};

const orbitalControls = {
    zoomSpeed: 0.2,
    rotateSpeed: 0.5,
    noKeys: true,
    maxDistance: 1500
};

const seeds = {
    geometry: new THREE.SphereBufferGeometry(10, 10, 10),
    material() {
        return new THREE.MeshBasicMaterial({ color: 0x888888, morphTargets: true });
    },
    morphTargetInfluences(seed) {
        seed.morphTargetInfluences = [Math.sin(4 * Date.now() * 0.001) / 4];
    }
};

const sources = ['lastfm'];

const stars = {
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
};

module.exports = {
    camera,
    events,
    flyControls,
    force,
    globe,
    light,
    node,
    orbitalControls,
    seeds,
    sources,
    stars
};
