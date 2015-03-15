var _ = require('underscore');
var THREE = require('three');
var Threes = require('./three/main');

var Dispatch = require('./dispatch');
var scene = require('./three/scene');
var ArtistManager = require('./artists');
var Constants = require('./constants');

var hud = {
    template: _.template("<span><%= artist %>, played <%= plays %> time(s)</span>" +
                         "<span>face.a = <%= a %></span>" +
                         "<span>face.b = <%= b %></span>" +
                         "<span>face.c = <%= c %></span>"),

    blankTemplate: _.template("<span>face.a = <%= a %></span>" +
                              "<span>face.b = <%= b %></span>" +
                              "<span>face.c = <%= c %></span>"),
    mouse: { x: 0, y: 0 },

    init: function() {
        this.active = null;
        this.showing = false;
        this.activeMarkers = [];

        Dispatch.on('debugging', function(evt, debugging) {
            if (!debugging) {
                return this.removeMarkers();
            }
        }.bind(this));
    },

    bind: function(element) {
        element.addEventListener('click', function(evt) {
            if (evt.target.nodeName === 'BUTTON') {
                return false;
            }
            this.updateMouse(evt);
            this.updateActive();
        }.bind(this));

        return this;
    },

    removeMarkers: function() {
        _.each(this.activeMarkers, function(mark) {
            scene.remove(mark);
        });
        this.activeMarkers = [];
    },

    updateMouse: function(evt) {
        this.mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    },

    findIntersects: function() {
        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
        vector.unproject(Threes.camera);
        var position = Threes.camera.position;
        var ray = new THREE.Raycaster(position, vector.sub(position).normalize());
        return ray.intersectObject(Threes.mesh.globe);
    },

    updateActive: function() {
        var intersects = this.findIntersects();
        var data, faces, vertices;

        if (intersects.length === 0) {
            this.active = null;
            return;
        }

        var face = intersects[0].face;
        var isPainted = face.data && face.data.artist;
        if (face != this.active) {
            this.active = face;

            if (App.debugging) {
                this.removeMarkers();

                if (isPainted) {
                    this.setVerticesFromArtistEdges(this.active.data.artist);

                    faces = _.filter(Threes.mesh.globe.geometry.faces, function(face) {
                        return face.data.artist === this.active.data.artist;
                    }.bind(this));
                    for (var i in faces) {
                        this.addFaceMarkers(faces[i]);
                    }
                } else {
                    this.addVertexMarkers([face.a, face.b, face.c]);
                    this.addFaceMarkers(face);
                }
            }
        }

        if (isPainted) {
            data = _.extend({}, this.active.data, {
                a: this.active.a,
                b: this.active.b,
                c: this.active.c,
            });
            App.hudContainer.innerHTML = this.template(data);
            App.hudContainer.style.display = 'block';
        } else {
            data = _.extend({}, this.active.data, {
                a: this.active.a,
                b: this.active.b,
                c: this.active.c,
            });
            App.hudContainer.innerHTML = this.blankTemplate(data);
            App.hudContainer.style.display = 'block';
        }
    },

    setVerticesFromArtistEdges: function(artist) {
        var edges = ArtistManager.edgesForArtist(artist);
        vertices = Threes.mesh.utils.uniqueVerticesForEdges(edges);
        this.addVertexMarkers(vertices);
    },

    addVertexMarkers: function(vertices) {
        var mesh = Threes.mesh;
        var mark, vertex;
        _.each(vertices, function(index) {
            mark = this.makeMark(JSON.stringify(index));
            vertex = mesh.globe.geometry.vertices[index];
            mark.position.copy(vertex.clone().multiplyScalar(1.005));
            this.activeMarkers.push(mark);
            scene.add(mark);
        }.bind(this));
    },

    addFaceMarkers: function(face) {
        var mark = this.makeMark(Threes.mesh.globe.geometry.faces.indexOf(face));
        mark.position.copy(Threes.mesh.utils.faceCentroid(face).multiplyScalar(1.005));
        this.activeMarkers.push(mark);
        scene.add(mark);
    },

    getMarkProp: function(key) {
        var value = Constants.labels[key];
        // if the value is a string, return it, otherwise return
        // the number as an integer
        return isNaN(value) ? value : +value;
    },

    makeMark: function(message) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1600;
        var context = canvas.getContext('2d');

        var backgroundColor = this.getMarkProp('backgroundColor');
        var color = this.getMarkProp('color');
        var fontface = this.getMarkProp('fontface');
        var fontsize = this.getMarkProp('fontsize');

        context.font = fontsize + 'px ' + fontface;

        var textWidth = context.measureText(message).width;
        if (textWidth > canvas.width) {
            canvas.width = canvas.height = textWidth;
            context = canvas.getContext('2d');
            context.font = fontsize + 'px ' + fontface;
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

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    }
};

hud.init();
module.exports = hud;
