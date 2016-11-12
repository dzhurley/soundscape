const THREE = require('three');

const { globe: { radius } } = require('constants');
const { artistsLeft } = require('artists');
const { equidistantishPointsOnSphere } = require('helpers');
const { globe, position } = require('three/globe');
const scene = require('three/scene');

const addEquidistantMarks = num => equidistantishPointsOnSphere(num).map(p => {
    let mark = new THREE.Sprite(new THREE.SpriteMaterial());
    mark.position.set(...p);
    mark.position.multiplyScalar(radius + 2);
    scene.add(mark);
    return mark;
});

const equidistantFaces = numMarkers => {
    // add transient helper marks
    let markers = addEquidistantMarks(numMarkers);
    let caster = new THREE.Raycaster();
    let intersectingFaces = [];

    // use the mark's vector as a ray to find the closest face
    // via its intersection
    markers.map(m => {
        caster.set(position(), m.position.normalize());
        intersectingFaces.push(caster.intersectObject(globe));
    });

    // clean up transient markers
    markers.map(mark => scene.remove(mark));

    // return at most one face for each intersection
    return intersectingFaces.map(hit => hit[0]);
};

const seedIndices = () => equidistantFaces(artistsLeft().length).map(seed => seed.faceIndex);

module.exports = seedIndices;
