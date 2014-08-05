define([
    'underscore',
    'threejs',
    'three/scene'
], function(_, THREE, scene) {
    return function(geometry) {
        var Edger = {
            geo: geometry,
            northVerts: [],
            southVerts: [],
            seams: [],

            wrangleVertices: function() {
                // THREE doesn't combine the two polar vertices into one object,
                // instead storing a separate vertex for each face that connects
                // to the pole. These return the groupings of both pole's vertices
                // to compare with in processing.faces.validFace.
                this.northVerts = _.filter(this.geo.vertices, function(v) {
                    return v.y === this.geo.radius;
                });
                this.southVerts = _.filter(this.geo.vertices, function(v) {
                    return v.y === -this.geo.radius;
                });

                function indexify(vert) {
                    return this.geo.vertices.indexOf(vert);
                }
                this.northVerts = _.map(this.northVerts, indexify);
                this.southVerts = _.map(this.southVerts, indexify);

                // there exists a seam on the globe running across the surface from
                // pole to pole where 2 vertices share the same coordinates. we need
                // pairings of these seam vertices to properly find valid adjacent
                // faces in processing.faces.validFace.
                this.seams = {};

                var first;
                var pair;
                var second;
                for (var i = 1; i < this.widthSegments; i++) {
                    first = (i * this.widthSegments) + i;
                    second = ((i + 1) * this.widthSegments) + i;
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
                    genEdge.v1 = this.generalVert(edge.v1, 'v1');
                }
                if (!_.isArray(edge.v2)) {
                    genEdge.v2 = this.generalVert(edge.v2, 'v2');
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
                return _.filter(this.geo.faces, _.bind(function(face) {
                    if (this.sameEdge(edge, {v1: face.a, v2: face.b})) {
                        return true;
                    } else if (this.sameEdge(edge, {v1: face.a, v2: face.c})) {
                        return true;
                    } else if (this.sameEdge(edge, {v1: face.b, v2: face.c})) {
                        return true;
                    }
                    return false;
                }, this), edge);
            },

            removeEdge: function(edges, edge) {
                // remove an edge from a set of edges, taking into account the poles
                // and seam in comparisons.
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
            }
        };

        return Edger;
    };
});
