const THREE = require('three');
const TWEEN = require('tween.js');

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

    // globe setup events
    'seed',
    'seeded',
    'paint',
    'gaps',
    'painted'
]);

const flyControls = Object.freeze({
    autoForward: false,
    dragToLook: true,
    movementSpeed: 1,
    rollSpeed: 0.03
});

const force = Object.freeze({
    epsilon: 0.00001,
    globeDivisor: 1.5,
    initialTemp: 1000,
    maxIterations: 10000
});

const globe = Object.freeze({
    axisSize: 800,
    defaultFaceColor: 0xFFFFFF,
    pendingFaceChunk: 5000,
    radius: 300,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    widthAndHeight: 300,
    vertexColors: THREE.FaceColors
});

const light = Object.freeze({ color: 0xf0f0f0 });

const node = Object.freeze({
    geometry() {
        return new THREE.SphereBufferGeometry(node.radius, 3, 2);
    },
    material(color) {
        return new THREE.MeshBasicMaterial({ color });
    },
    radius: 15
});

const orbitalControls = Object.freeze({
    zoomSpeed: 0.2,
    rotateSpeed: 0.5,
    noKeys: true,
    maxDistance: 1500
});

const seeds = Object.freeze({
    animations: Object.freeze({
        move(from, to) {
            const { x, y, z } = to;
            return new TWEEN.Tween(from)
                .to({ x, y, z }, 1000)
                .easing(TWEEN.Easing.Elastic.Out);
        },
        show(from) {
            from.multiplyScalar(globe.radius - 40);
            const { x, y, z } = from.clone().multiplyScalar(1.25);
            return new TWEEN.Tween(from)
                .to({ x, y, z }, 1000)
                .easing(TWEEN.Easing.Bounce.Out)
                .delay(Math.random() * 1000);
        },
        sink(from) {
            return new TWEEN.Tween(from)
                .to({ x: from.x / 1.1, y: from.y / 1.1, z: from.z / 1.1 }, 1000);
        }
    }),

    geometry: new THREE.SphereBufferGeometry(10, 10, 10),
    material() {
        return new THREE.MeshBasicMaterial({ color: 0x888888, morphTargets: true });
    },
    morphTargetInfluences(seed) {
        seed.morphTargetInfluences = [Math.sin(4 * Date.now() * 0.001) / 4];
    }
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
    seeds,
    sources,
    stars
});
