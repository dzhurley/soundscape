const THREE = require('three');
THREE.ConvexGeometry = require('exports?THREE.ConvexGeometry!three/examples/js/geometries/ConvexGeometry');

const { emit, on } = require('dispatch');
const scene = require('three/scene');
const { globe } = require('three/globe');

const caster = new THREE.Raycaster();

const updateFace = (face, source) => {
    face.color.set(source.color);
    Object.assign(face.data, source.data);
};

const convexFor = vertices => {
    const hull = new THREE.Mesh(
        new THREE.ConvexGeometry(vertices),
        new THREE.MeshBasicMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        })
    );
    hull.geometry.mergeVertices();
    return hull;
};

const findClosestSeed = (candidates, target) => {
    let closest, newDistance, lastDistance;
    for (let i = 0; i < candidates.length; i++) {
        newDistance = target.normal.distanceTo(candidates[i]);
        if (!closest) {
            closest = candidates[i];
            lastDistance = newDistance;
        } else if (newDistance < lastDistance) {
            closest = candidates[i];
            lastDistance = newDistance;
        }
    }
    return closest;
};

const voronoiFromHull = hull => {
    const voronoi = convexFor(hull.geometry.faces.map(face => face.normal), 0x0000FF);
    voronoi.scale.multiplyScalar(320);

    hull.geometry.vertices.map(vertex => {
        caster.set(scene.position, vertex.clone().normalize());
        caster.intersectObject(voronoi)[0].face.color.set(vertex.color);
    });

    voronoi.geometry.faces.map(face => {
        const closest = findClosestSeed(hull.geometry.vertices, face);
        face.data = {};
        updateFace(face, closest);
    });

    voronoi.scale.multiplyScalar(20);
    return voronoi;
};

const paintGlobe = voronoi => {
    globe.geometry.faces.map(face => {
        caster.set(scene.position, face.normal.clone().normalize());
        // TODO: handle multiple hits and overlaps (distance from normal?)
        const hit = caster.intersectObject(voronoi)[0];
        updateFace(face, hit.face);
    });
    globe.geometry.colorsNeedUpdate = true;
};

const paint = seeds => {
    const vertices = seeds.map(seed => {
        seed.position.color = seed.material.color;
        seed.position.data = { artist: seed.name };
        return seed.position;
    });

    const voronoi = voronoiFromHull(convexFor(vertices));
    seeds.map(seed => scene.remove(seed));
    scene.add(voronoi);

    paintGlobe(voronoi);
    scene.remove(voronoi);

    emit('painted');
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
