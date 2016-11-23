const THREE = require('three');
THREE.ConvexGeometry = require('exports?THREE.ConvexGeometry!three/examples/js/geometries/ConvexGeometry');

const { on } = require('dispatch');
const scene = require('three/scene');
const { globe } = require('three/globe');

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

    const caster = new THREE.Raycaster();
    hull.geometry.vertices.map(vertex => {
        caster.set(scene.position, vertex.clone().normalize());
        caster.intersectObject(voronoi)[0].face.color.set(vertex.color);
    });

    voronoi.geometry.faces.map(face => {
        const closest = findClosestSeed(hull.geometry.vertices, face);
        face.color.set(closest.color);
    });

    voronoi.scale.multiplyScalar(20);
    return voronoi;
};

const paintGlobe = voronoi => {
    const caster = new THREE.Raycaster();
    globe.geometry.faces.map(face => {
        caster.set(scene.position, face.normal.clone().normalize());
        const hit = caster.intersectObject(voronoi)[0];
        face.color.set(hit.face.color);
    });
    globe.geometry.colorsNeedUpdate = true;
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
    seeds.map(seed => scene.remove(seed));

    paintGlobe(voronoi);
    scene.remove(voronoi);
};

const bindPainter = () => on('seed', paint);

module.exports = bindPainter;
