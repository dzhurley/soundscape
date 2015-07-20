'use strict';

/* Displays artist and face information on click
 *
 * A constant display for artist info is updated on click
 * with the closest artist. All faces and vertices in a
 * given artist's region are also annotated with their
 * indices for debugging purposes.
 */

let THREE = require('three');
let Constants = require('./constants');
let Threes = require('./three/main');

let DOM = require('./dom');
let ArtistManager = require('./artists');

class HUD {
    template({artist, plays, a, b, c}) {
        return `<span>${artist}, played ${plays} time(s)</span>
                <span>face.a = ${a}</span>
                <span>face.b = ${b}</span>
                <span>face.c = ${c}</span>`;
    }

    blankTemplate({a, b, c}) {
        return `<span>face.a = ${a}</span>
                <span>face.b = ${b}</span>
                <span>face.c = ${c}</span>`;
    }

    constructor() {
        this.active = null;
        this.showing = false;
        this.activeMarkers = [];
        this.mouse = { x: 0, y: 0 };
        this.globe = Threes.mesh.globe;
    }

    attachTo(element) {
        element.addEventListener('click', (evt) => {
            if (evt.target.nodeName === 'BUTTON') {
                return false;
            }
            this.updateMouse(evt);
            this.updateActive();
        });
    }

    updateMouse(evt) {
        this.mouse.x = evt.clientX / window.innerWidth * 2 - 1;
        this.mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    }

    getIntersects() {
        let vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        vector.unproject(Threes.camera);
        let position = Threes.camera.position;
        let ray = new THREE.Raycaster(position, vector.sub(position).normalize());
        return ray.intersectObject(this.globe);
    }

    updateActive() {
        let intersects = this.getIntersects();
        if (intersects.length === 0) {
            this.active = null;
            return;
        }

        let face = intersects[0].face;
        let isPainted = face.data && face.data.artist;

        if (face !== this.active) {
            this.active = face;

            this.removeMarkers();

            if (isPainted) {
                this.setVerticesFromArtistEdges(this.active.data.artist);

                this.globe.geometry.faces.filter(
                    (face) => face.data.artist === this.active.data.artist
                ).map((face) => this.addFaceMarkers(face));
            } else {
                this.addVertexMarkers([face.a, face.b, face.c]);
                this.addFaceMarkers(face);
            }
        }

        let data = Object.assign({}, this.active.data, {
            a: this.active.a,
            b: this.active.b,
            c: this.active.c
        });
        DOM.hudContainer.innerHTML = isPainted ?
            this.template(data) :
            this.blankTemplate(data);
        DOM.hudContainer.style.display = 'block';
    }

    setVerticesFromArtistEdges(artist) {
        let edges = ArtistManager.edgesForArtist(artist);
        let vertices = this.globe.uniqueVerticesForEdges(edges);
        this.addVertexMarkers(vertices);
    }

    addVertexMarkers(vertices) {
        let mark, vertex;
        vertices.forEach((index) => {
            mark = this.makeMark(JSON.stringify(index));
            vertex = this.globe.geometry.vertices[index];
            mark.position.copy(vertex.clone().multiplyScalar(1.005));
            this.activeMarkers.push(mark);
            Threes.scene.add(mark);
        });
    }

    addFaceMarkers(face) {
        let mark = this.makeMark(this.globe.geometry.faces.indexOf(face));
        mark.position.copy(this.globe.faceCentroid(face).multiplyScalar(1.005));
        this.activeMarkers.push(mark);
        Threes.scene.add(mark);
    }

    getMarkProp(key) {
        let value = Constants.labels[key];
        // if the value is a string, return it, otherwise return
        // the number as an integer
        return isNaN(value) ? value : +value;
    }

    makeMark(message) {
        let canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1600;
        let context = canvas.getContext('2d');

        let backgroundColor = this.getMarkProp('backgroundColor');
        let color = this.getMarkProp('color');
        let fontface = this.getMarkProp('fontface');
        let fontsize = this.getMarkProp('fontsize');

        context.font = `${fontsize}px ${fontface}`;

        let textWidth = context.measureText(message).width;
        if (textWidth > canvas.width) {
            canvas.width = canvas.height = textWidth;
            context = canvas.getContext('2d');
            context.font = `${fontsize}px ${fontface}`;
        }

        context.fillStyle = backgroundColor;
        context.fillRect(
            canvas.width * 0.25,
            canvas.height / 2 - fontsize,
            canvas.width * 0.5,
            canvas.height / 3
        );

        context.fillStyle = color;
        context.textAlign = 'center';
        context.fillText(message, canvas.width / 2, canvas.height / 2);

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    }

    removeMarkers() {
        this.activeMarkers.forEach((mark) => Threes.scene.remove(mark));
        this.activeMarkers = [];
    }
}

module.exports = new HUD();
