define([
    'underscore',
    'threejs',
    './scene'
], function(_, THREE, scene) {

    var radius = 30;
    var widthAndHeight = 30;

    var globe = new THREE.Mesh(
        new THREE.SphereGeometry(radius, widthAndHeight, widthAndHeight),
        new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.FaceColors
        })
    );

    var stars = [];
    var star;

    for (var i = 0; i < 100; ++i) {
        star = new THREE.Sprite(new THREE.SpriteMaterial());
        star.position.x = Math.random() * 2 - 1;
        star.position.y = Math.random() * 2 - 1;
        star.position.z = Math.random() * 2 - 1;

        star.position.normalize();
        star.position.multiplyScalar(Math.random() * 100 + 200);
        star.scale.multiplyScalar(Math.random() * 0.5);
        stars.push(star);
    }

    var mesh = {
        radius: radius,
        widthAndHeight: widthAndHeight,

        globe: globe,
        stars: stars,

        addToScene: function() {
            this.wrangleVertices();
            scene.add(mesh.globe);
            _.map(mesh.stars, function(star) {
                scene.add(star);
            });
        },

        wrangleVertices: function() {
            // THREE doesn't combine the two polar vertices into one object,
            // instead storing a separate vertex for each face that connects
            // to the pole. These return the groupings of both pole's vertices
            // to compare with in processing.faces.validFace.
            this.northVerts = _.filter(globe.geometry.vertices, function(v) {
                return v.y === radius;
            });
            this.southVerts = _.filter(globe.geometry.vertices, function(v) {
                return v.y === -radius;
            });

            function indexify(vert) {
                return globe.geometry.vertices.indexOf(vert);
            }
            this.northVerts = _.map(this.northVerts, indexify);
            this.southVerts = _.map(this.southVerts, indexify);

            // there exists a seam on the globe running across the surface from
            // pole to pole where 2 vertices share the same coordinates. we need
            // pairings of these seam vertices to properly find valid adjacent
            // faces in processing.faces.validFace.
            var wh = this.widthAndHeight;
            this.seams = {};

            var first;
            var pair;
            var second;
            for (var i = 1; i < this.widthAndHeight; i++) {
                first = (i * this.widthAndHeight) + i;
                second = ((i + 1) * this.widthAndHeight) + i;
                pair = [first, second];

                // store at both spots for more reasonable lookup
                this.seams[first] = pair;
                this.seams[second] = pair;
            }
        },

        generalVert: function(vert) {
            var sames;
            if (_.contains(this.northVerts, vert)) {
                // handle case where vertex is one of the pole vertices
                sames = this.northVerts;
            } else if (_.contains(this.southVerts, vert)) {
                sames = this.southVerts;
            } else if (_.has(this.seams, '' + vert)) {
                // handle case where vertex is on the seam
                sames = this.seams['' + vert];
            } else {
                sames = [vert];
            }
            return sames;
        },

        generalEdge: function(edge) {
            var genEdge = {};
            if (!_.isArray(edge.v1)) {
                genEdge['v1'] = this.generalVert(edge.v1, 'v1');
            }
            if (!_.isArray(edge.v2)) {
                genEdge['v2'] = this.generalVert(edge.v2, 'v2');
            }
            return genEdge;
        },

        sameEdge: function(first, second) {
            var firstVerts = this.generalEdge(first);
            var secondVerts = this.generalEdge(second);
            if (_.isEqual(firstVerts.v1, secondVerts.v1)) {
                return _.isEqual(firstVerts.v2, secondVerts.v2);
            } else if (_.isEqual(firstVerts.v1, secondVerts.v2)) {
                return _.isEqual(firstVerts.v2, secondVerts.v1);
            }
            return false;
        },

        facesForEdge: function(edge) {
            var genEdge = this.generalEdge(edge);
            return _.filter(this.globe.geometry.faces, _.bind(function(face) {
                if (App.three.mesh.sameEdge(genEdge, {v1: face.a, v2: face.b})) {
                    return true;
                } else if (App.three.mesh.sameEdge(genEdge, {v1: face.a, v2: face.c})) {
                    return true;
                } else if (App.three.mesh.sameEdge(genEdge, {v1: face.b, v2: face.c})) {
                    return true;
                }
                return false;
            }, this), genEdge);
        },

        removeEdge: function(edges, edge) {
            var verts = this.generalEdge(edge);
            var match = _.find(edges, function(e) {
                return _.contains(verts.v1, e.v1) && _.contains(verts.v2, e.v2);
            });
            if (match) {
                edges.splice(edges.indexOf(match), 1);
            } else {
                match = _.find(edges, function(e) {
                    return _.contains(verts.v1, e.v2) && _.contains(verts.v2, e.v1);
                });
                if (match) {
                    edges.splice(edges.indexOf(match), 1);
                }
            }
        },

        update: function() {
            this.globe.geometry.colorsNeedUpdate = true;
        }
    };

    return mesh;
});
