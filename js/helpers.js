const THREE = require('three');

// internal

const boundedArray = (min = 0, max = 0) => {
    // enumerates numbers between `min` and `max` inclusive
    let bounded = [];
    for (let i = min; i <= max; ++i) {
        bounded.push(i);
    }
    return bounded;
};

const evenlySpacedInRange = (min, max, num) => {
    // see linspace (port of numpy method)
    // https://github.com/sloisel/numeric/blob/master/src/numeric.js
    if (num < 2) return num === 1 ? [min] : [];

    let results = Array(num);
    for (let i = --num; i >= 0; i--) {
        results[i] = (i * max + (num - i) * min) / num;
    }
    return results;
};

// external

const equidistantPointsOnSphere = numPoints => {
    // Find points in terms of x, y, z that are roughly equidistant from
    // each other on a sphere. This applies Vogel's method, adapted from
    // http://blog.marmakoide.org/?p=1

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const thetas = boundedArray(0, numPoints - 1).map(n => n * goldenAngle);

    const zs = evenlySpacedInRange(
        1 - 1.0 / numPoints,
        1.0 / numPoints - 1,
        numPoints
    );

    const radii = zs.map(z => Math.sqrt(1 - z * z));

    let points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push([
            radii[i] * Math.cos(thetas[i]),
            radii[i] * Math.sin(thetas[i]),
            zs[i]
        ]);
    }
    return points;
};

// save deprecated face.centroid
const faceCentroid = (object, face) => {
    return new THREE.Vector3()
        .add(object.geometry.vertices[face.a])
        .add(object.geometry.vertices[face.b])
        .add(object.geometry.vertices[face.c])
        .divideScalar(3);
};

// find object underneath current mouse position
const intersectObject = (evt, object, camera) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({
        x: evt.clientX / window.innerWidth * 2 - 1,
        y: -(evt.clientY / window.innerHeight) * 2 + 1
    }, camera);
    return raycaster.intersectObject(object);
};

// preload a normalize function with its min/max to progressively normalize
const normalizeAgainst = values => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const denom = max - min;
    return item => (item - min) / denom;
};

// pack key/values into encoded url params, delimited by '&'
const packUrlParams = (base, params) => {
    let encodedPairs = Object.keys(params).map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    );
    return `${base}?${encodedPairs.join('&')}`;
};

// pulled from underscore.js
const randomArray = array => {
    const length = array.length;
    let shuffled = Array(length);
    for (let i = 0, rand; i < length; i++) {
        rand = Math.floor(Math.random() * i);
        if (rand !== i) shuffled[i] = shuffled[rand];
        shuffled[rand] = array[i];
    }
    return shuffled;
};

const randomBoundedArray = (min, max) => randomArray(boundedArray(min, max));

// http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
const spacedColor = (numOfSteps, step) => {
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;

    switch (i % 6) {
    case 0: r = 1; g = f; b = 0; break;
    case 1: r = q; g = 1; b = 0; break;
    case 2: r = 0; g = 1; b = f; break;
    case 3: r = 0; g = q; b = 1; break;
    case 4: r = f; g = 0; b = 1; break;
    case 5: r = 1; g = 0; b = q; break;
    }

    let first = ('00' + (~~(r * 255)).toString(16)).slice(-2);
    let second = ('00' + (~~(g * 255)).toString(16)).slice(-2);
    let third = ('00' + (~~(b * 255)).toString(16)).slice(-2);
    return `#${first}${second}${third}`;
};

// shorthand
const qs = (selector, node=document) => node.querySelector(selector);
const qsa = (selector, node=document) => Array.from(node.querySelectorAll(selector));

module.exports = {
    equidistantPointsOnSphere,
    faceCentroid,
    intersectObject,
    normalizeAgainst,
    packUrlParams,
    qs,
    qsa,
    randomArray,
    randomBoundedArray,
    spacedColor
};
