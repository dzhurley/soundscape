define([
    'underscore',
    'helpers',
    'threejs'
], function(_, h, THREE) {
    return function() {
        var facer = {
            faces: App.three.mesh.globe.geometry.faces,
            vertices: App.three.mesh.globe.geometry.vertices,
            norths: App.three.mesh.northVerts,
            souths: App.three.mesh.southVerts,
            seams: App.three.mesh.seams,

            getSameVertices: function(edge) {
                var vertices = {};

                function getSames(vert, key) {
                    var sames;
                    if (_.contains(this.norths, vert)) {
                        // handle case where vertex is one of the pole vertices
                        sames = this.norths;
                    } else if (_.contains(this.souths, vert)) {
                        sames = this.souths;
                    } else if (_.has(this.seams, '' + vert)) {
                        // handle case where vertex is on the seam
                        sames = this.seams['' + vert];
                    } else {
                        sames = [vert];
                    }
                    vertices[key] = sames;
                }

                getSames.call(this, edge.v1, 'v1');
                getSames.call(this, edge.v2, 'v2');
                return vertices;
            },

            validFace: function(artist, edge) {
                var swappers = [];
                var verts = this.getSameVertices(edge);

                function intertains(first, second) {
                    return !_.isEmpty(_.intersection(first, second));
                }

                var face = _.filter(this.faces, _.bind(function(f) {
                    var valid = false;

                    if (_.contains(verts.v1, f.a)) {
                        valid = intertains(verts.v2, [f.b, f.c]);
                    } else if (_.contains(verts.v1, f.b)) {
                        valid = intertains(verts.v2, [f.a, f.c]);
                    } else if (_.contains(verts.v1, f.c)) {
                        valid = intertains(verts.v2, [f.a, f.b]);
                    }

                    if (valid && !_.isUndefined(f.data.artist)) {
                        // if it's adjacent but taken, remember it in case we
                        // don't find a free face so we can swap in place
                        swappers.push(f);
                        return false;
                    }
                    return valid;
                }, this));

                if (face.length === 1) {
                    return face[0];
                }

                var swappersLeft = _.without(swappers, _.find(swappers, function(f) {
                    // make sure one of the candidates isn't for the same artist
                    return f.data.artist === artist.name;
                }));

                return swappersLeft;
            },

            sameEdge: function(first, second) {
                var firstVerts = this.getSameVertices(first);
                var secondVerts = this.getSameVertices(second);
                if (_.isEqual(first.v1, second.v1)) {
                    return _.isEqual(first.v2, second.v2);
                } else if (_.isEqual(first.v1, second.v2)) {
                    return _.isEqual(first.v2, second.v1);
                }
            },

            removeEdge: function(edges, edge) {
                var verts = this.getSameVertices(edge);
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

            expandArtistEdges: function(face, artist, edge) {
                var second;
                var third;

                artist.edges.splice(artist.edges.indexOf(edge), 1);
                if (face.a !== edge.v1 && face.a !== edge.v2) {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.a, v2: face.c};
                } else if (face.b !== edge.v1 && face.b !== edge.v2) {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.b, v2: face.c};
                } else {
                    second = {v1: face.a, v2: face.c};
                    third = {v1: face.b, v2: face.c};
                }
                artist.edges.push(second, third);

                if (face.data.artist && face.data.artist !== artist.name) {
                    // we're swapping with another, so update the swapped artist
                    // with new edges/faces info
                    var swappedArtist = _.findWhere(App.processor.artister.artists,
                                                    {name: face.data.artist});
                    swappedArtist.faces++;
                    _.each([edge, second, third], _.bind(function(e) {
                        this.removeEdge(swappedArtist.edges, e);
                    }, this));
                }
            },

            findAdjacentFace: function(artist) {
                // use random `artist.edges` to find an adjacent unpainted `face`
                var edges = _.clone(artist.edges);
                var artistIndex;
                var edge;
                var faceOrSwap;
                var swappedArtist;
                var swapper;

                while (edges.length) {
                    edge = _.sample(edges);
                    faceOrSwap = this.validFace(artist, edge);

                    if (!_.isArray(faceOrSwap)) {
                        // found valid face, stop looking for more
                        this.expandArtistEdges(faceOrSwap, artist, edge);
                        break;
                    }

                    if (edges.length) {
                        // we found a boundary with another artist, but there are more
                        // edges available to check, retry with another random edge
                        edges.splice(edges.indexOf(edge), 1);
                        if (edges.length) {
                            continue;
                        }
                    }

                    // replace a bordering artist's face with one for this artist, updating
                    // each artist's edges and faces info
                    faceOrSwap = faceOrSwap[0];
                    this.expandArtistEdges(faceOrSwap, artist, edge);

                    // call directly so it won't get dropped while searching for a free face
                    artistIndex = App.processor.artister.artists.indexOf(artist);
                    App.processor.looper.setFace(faceOrSwap, artist, artistIndex);
                }
                return {face: faceOrSwap, index: this.faces.indexOf(faceOrSwap)};
            },

            nextFace: function(artist, rando) {
                var face = this.faces[rando];

                // unmarked face
                if (_.isUndefined(artist.edges)) {
                    artist.edges = [];
                    artist.edges.push({v1: face.a, v2: face.b},
                                      {v1: face.b, v2: face.c},
                                      {v1: face.a, v2: face.c});
                    return {face: face, index: this.faces.indexOf(face)};
                }
                // artist has been painted somewhere else
                return this.findAdjacentFace(artist);
            }
        };

        return facer;
    };
});
