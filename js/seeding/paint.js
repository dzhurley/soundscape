const THREE = require('three');
THREE.ConvexGeometry = require('exports?THREE.ConvexGeometry!three/examples/js/geometries/ConvexGeometry');

const { on } = require('dispatch');
const { faceCentroid } = require('helpers');
const scene = require('three/scene');

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

const normal = (mesh, face) => faceCentroid(mesh, face).normalize();

const findClosestSeed = (mesh, candidates, target) => {
    let closest, newDistance, lastDistance;
    for (let i = 0; i < candidates.length; i++) {
        newDistance = normal(mesh, target).distanceTo(candidates[i]);
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
    voronoi.scale.multiplyScalar(315);

    const caster = new THREE.Raycaster();
    hull.geometry.vertices.map(vertex => {
        caster.set(scene.position, vertex.clone().normalize());
        caster.intersectObject(voronoi)[0].face.color.set(vertex.color);
    });

    voronoi.geometry.faces.map(face => {
        const closest = findClosestSeed(voronoi, hull.geometry.vertices, face);
        face.color.set(closest.color);
    });

    return voronoi;
};

const paint = seeds => {
    const vertices = seeds.map(seed => {
        seed.position.name = seed.name;
        seed.position.color = seed.material.color;
        return seed.position;
    });

    const hull = convexFor(vertices);

    const voronoi = voronoiFromHull(hull);
    scene.add(voronoi);

    // TODO: paint
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
