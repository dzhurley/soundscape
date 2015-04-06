// internal

let boundedArray = (min = 0, max = 0) => {
    // enumerates numbers between `min` and `max` inclusive
    // and returns the array

    let bounded = [];
    for (let i = min; i <= max; ++i) {
        bounded.push(i);
    }

    return bounded;
};

let evenlySpacedInRange = (min, max, num) => {
    // see linspace (port of numpy method)
    // https://github.com/sloisel/numeric/blob/master/src/numeric.js
    if (num < 2) return num === 1 ? [min] : [];

    let results = Array(num);
    num--;
    for (let i = num; i >= 0; i--) {
        results[i] = (i * max + (num - i) * min) / num;
    }
    return results;
};

// external

let equidistantishPointsOnSphere = (numPoints) => {
    // Find points in terms of x, y, z that are roughly equidistant from
    // each other on a sphere. This applies Vogel's method, adapted from
    // http://blog.marmakoide.org/?p=1

    let goldenAngle = Math.PI * (3 - Math.sqrt(5));
    let thetas = boundedArray(0, numPoints - 1).map((n) => n * goldenAngle);

    let zs = evenlySpacedInRange(
        (1 - 1.0 / numPoints),
        (1.0 / numPoints - 1),
        numPoints
    );

    let radii = zs.map((z) => Math.sqrt(1 - z * z));

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

let normalize = (data, key, saveAs) => {
    // normalizes values in `data` at `data[key]` and optionally saves
    // them on each item as `data[saveAs]`, returning `data` when saving
    // and Array of normalized values when not

    let counts = data.map((datum) => datum[key]);
    let max = Math.max(...counts);
    let min = Math.min(...counts);
    let denom = max - min;

    if (saveAs) {
        data.forEach((datum) => {
            datum[saveAs] = (datum[key] - min) / denom;
        });
        return data;
    }
    return data.map((datum) => (datum[key] - min) / denom );
};

let packUrlParams = (base, params) => {
    // pack key/values into encoded url params, delimited by '&'
    let encodedPairs = Object.keys(params).map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    );
    return `${base}?${encodedPairs.join('&')}`;
};

let randomArray = (array) => {
    // pulled from underscore.js
    let length = array.length;
    let shuffled = Array(length);
    for (let i = 0, rand; i < length; i++) {
        rand = Math.floor(Math.random() * i);
        if (rand !== i) shuffled[i] = shuffled[rand];
        shuffled[rand] = array[i];
    }
    return shuffled;
};

let randomBoundedArray = (min, max) => randomArray(boundedArray(min, max));

let spacedColor = (numOfSteps, step) => {
    // http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;

    switch(i % 6){
        case 0: r = 1, g = f, b = 0; break;
        case 1: r = q, g = 1, b = 0; break;
        case 2: r = 0, g = 1, b = f; break;
        case 3: r = 0, g = q, b = 1; break;
        case 4: r = f, g = 0, b = 1; break;
        case 5: r = 1, g = 0, b = q; break;
    }

    let first = ('00' + (~ ~(r * 255)).toString(16)).slice(-2);
    let second = ('00' + (~ ~(g * 255)).toString(16)).slice(-2);
    let third = ('00' + (~ ~(b * 255)).toString(16)).slice(-2);
    return `#${first}${second}${third}`;
};

module.exports = {
    equidistantishPointsOnSphere,
    normalize,
    packUrlParams,
    randomBoundedArray,
    spacedColor
};
