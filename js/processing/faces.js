define([
    'underscore',
    'helpers',
    'threejs'
], function(_, h, THREE) {
    return function() {
        var facer = {
            faces: App.three.mesh.globe.geometry.faces,
            vertices: App.three.mesh.globe.geometry.vertices,

            validFace: function(artist, edge) {
                var swappers = [];
                var verts = App.three.mesh.generalEdge(edge);

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

            expandArtistEdges: function(face, artist, edge) {
                var second;
                var third;

                artist.edges.splice(artist.edges.indexOf(edge), 1);
                if (App.three.mesh.sameEdge(edge, {v1: face.a, v2: face.b})) {
                    second = {v1: face.a, v2: face.c};
                    third = {v1: face.b, v2: face.c};
                } else if (App.three.mesh.sameEdge(edge, {v1: face.a, v2: face.c})) {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.b, v2: face.c};
                } else {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.a, v2: face.c};
                }
                artist.edges.push(second, third);

                if (face.data.artist && face.data.artist !== artist.name) {
                    // we're swapping with another, so update the swapped artist
                    // with new edges/faces info
                    var faces;
                    var swappedArtist = _.findWhere(App.processor.artister.artists,
                                                    {name: face.data.artist});
                    swappedArtist.faces++;
                    _.each([edge, second, third], function(e) {
                        faces = App.three.mesh.facesForEdge(e);
                        if (!_.contains(faces, face)) {
                            // only remove this edge if it isn't in another face
                            // belonging to `swappedArtist`
                            App.three.mesh.removeEdge(swappedArtist.edges, e);
                        }
                    }, face);
                }
            },

            findAdjacentFace: function(artist) {
                // use random `artist.edges` to find an adjacent unpainted `face`
                var edges = _.clone(artist.edges);
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
                    App.processor.looper.setFace(faceOrSwap, artist);
                    return {face: false};
                }
                return {face: faceOrSwap, index: this.faces.indexOf(faceOrSwap)};
            },

            nextFace: function(artist, rando) {
                var face = this.faces[rando];

                if (face.data.artist) {
                    return {face: false};
                }

                if (_.isEmpty(artist.edges)) {
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
