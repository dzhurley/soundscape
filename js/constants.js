const { MeshBasicMaterial, SphereGeometry } = require('three');
const { DoubleSide, FaceColors, FlatShading } = require('three');

const camera = Object.freeze({
    position: { x: 80, y: 80, z: 80 },
    fov: 75,
    aspect() {
        // needs to be callable as constants are used in workers, which don't have window
        return window.innerWidth / window.innerHeight;
    },
    near: 0.1,
    far: 1000
});

const events = Object.freeze([
        // on form submission
    'submitting',
    // on POST to data source
    'submitted',

    // ui event
    'toggleControls',

    'lab.*',
    // a lab's trigger was emitted
    'lab.trigger',
    // a lab that requires reset was toggled
    'lab.reset',

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

const force = Object.freeze({
    epsilon: 0.000001,
    normalMax: 50,
    maxIterations: 100000,
    initialTemp: 10000
});

const globe = Object.freeze({
    axisSize: 75,
    defaultFaceColor: 0xFFFFFF,
    radius: 50,
    widthAndHeight: 50,
    shading: FlatShading,
    side: DoubleSide,
    vertexColors: FaceColors
});

const labels = Object.freeze({
    backgroundColor: '#272727',
    canvasHeightWidth: 1600,
    color: '#d7d7d7',
    fontface: 'Inconsolata',
    fontsize: '300',
    radius: 1.005
});

const labs = [
    Object.freeze({
        name: 'WireframeHelper',
        reset: false,
        trigger: '',
        value: true
    }),
    Object.freeze({
        name: 'AxisHelper',
        reset: false,
        trigger: '',
        value: true
    }),
    Object.freeze({
        name: 'forceSeeding',
        reset: true,
        trigger: 'submitted',
        value: false
    }),
    Object.freeze({
        name: 'iterateControl',
        reset: true,
        trigger: '',
        value: true
    })
];

const light = Object.freeze({ color: 0xf0f0f0 });

const node = Object.freeze({
    geometry: new SphereGeometry(1.5, 25, 25),
    material(color) {
        return new MeshBasicMaterial({ color });
    }
});

const orbitalControls = Object.freeze({
    zoomSpeed: 0.2,
    rotateSpeed: 0.5,
    noKeys: true
});

const sources = [
    'lastfm'
];

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
        return Math.random() * 100 + 200;
    },
    scaleMultiplier() {
        return Math.random() * 0.5;
    }
});

module.exports = Object.freeze({
    camera,
    events,
    flyControls,
    force,
    globe,
    labels,
    labs,
    light,
    node,
    orbitalControls,
    sources,
    stars
});
