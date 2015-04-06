let h = require('../../helpers');
let Constants = require('../../constants');
let THREE = require('../../lib/HalfEdgeStructure');

let Dispatch = require('../../dispatch');
let scene = require('../scene');
let Utils = require('./utils');

class Mesh {
    constructor() {
        this.radius = Constants.globe.radius;
        this.widthAndHeight = Constants.globe.widthAndHeight;

        this.globe = this.createGlobe();
        this.heds = new THREE.HalfEdgeStructure(this.globe.geometry);
        this.wireframe = this.createWireframe();
        this.stars = this.createStars();

        this.utils = new Utils(this.globe);

        Dispatch.on('faces.*', (payload) => {
            this.updateFaces(JSON.parse(payload.faces));
        });
    }

    resetGlobe() {
        this.utils.resetFaces();
    }

    createGlobe() {
        return new THREE.Mesh(
            new THREE.SphereGeometry(this.radius,
                                     this.widthAndHeight,
                                     this.widthAndHeight),
            new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
                vertexColors: THREE.FaceColors
            })
        );
    }

    createWireframe() {
        return new THREE.WireframeHelper(this.globe);
    }

    createStars() {
        let stars = [];
        let star;

        for (let i = 0; i < Constants.stars.number; ++i) {
            star = new THREE.Sprite(new THREE.SpriteMaterial());
            star.position.x = Constants.stars.initialX();
            star.position.y = Constants.stars.initialY();
            star.position.z = Constants.stars.initialZ();

            star.position.normalize();
            star.position.multiplyScalar(Constants.stars.positionMultiplier());
            star.scale.multiplyScalar(Constants.stars.scaleMultiplier());
            stars.push(star);
        }
        return stars;
    }

    addToScene() {
        scene.add(this.globe);
        scene.add(this.wireframe);
        this.stars.map((star) => scene.add(star));
    }

    getFaceIndex(face) {
        return parseInt(Object.keys(face)[0]);
    }

    updateFaces(newFaces) {
        let oldFaces = this.globe.geometry.faces;

        console.log('painting new faces:',
                    newFaces.map((face) => this.getFaceIndex(face)));

        newFaces.forEach((face) => {
            let index = this.getFaceIndex(face);
            oldFaces[index].color.copy(face[index].color);
            oldFaces[index].data = face[index].data;
        });

        this.globe.geometry.colorsNeedUpdate = true;
    }
}

module.exports = new Mesh();
