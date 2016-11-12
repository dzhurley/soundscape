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

    // passed from ui into worker to kick off plotting strategies
    'plot.*',
    'plot.seed',
    'plot.one',
    'plot.batch',
    'plot.all',

    // returned from worker to main thread for scene updates
    'faces.*',
    'faces.seeded',
    'faces.painted'
]);

const flyControls = Object.freeze({
    autoForward: false,
    dragToLook: true,
    movementSpeed: 1,
    rollSpeed: 0.03
});

const globe = Object.freeze({
    axisSize: 800,
    defaultFaceColor: 0xFFFFFF,
    radius: 300,
    widthAndHeight: 50,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    vertexColors: THREE.FaceColors
});

const labels = Object.freeze({
    backgroundColor: '#272727',
    canvasHeightWidth: 2048,
    color: '#d7d7d7',
    fontface: 'Inconsolata',
    fontsize: 450,
    radius: 1.005,
    scaleMultiplier: 16
});

const light = Object.freeze({ color: 0xf0f0f0 });

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
    globe,
    labels,
    light,
    orbitalControls,
    sources,
    stars
});
