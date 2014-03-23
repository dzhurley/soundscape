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
                var swapCandidates = [];

                var face = _.find(this.faces, function(f) {
                    var valid = false;
                    if (f.a === edge.v1) {
                        valid = f.b === edge.v2 || f.c === edge.v2;
                    } else if (f.b === edge.v1) {
                        valid = f.a === edge.v2 || f.c === edge.v2;
                    } else if (f.c === edge.v1) {
                        valid = f.a === edge.v2 || f.b === edge.v2;
                    }

                    if (valid && !_.isUndefined(f.data.artist)) {
                        // if it's adjacent but taken, remember it in case we
                        // don't find a free face so we can swap in place
                        swapCandidates.push(f);
                    }
                    return valid;
                });

                return face ? face : swapCandidates;
            },

            updateFaceAndArtist: function(face, artist, edge) {
                // update `face` and `artist.edges`
                face.data.artist = artist.name;
                artist.edges.splice(artist.edges.indexOf(edge), 1);
                if (face.a !== edge.v1 && face.a !== edge.v2) {
                    artist.edges.push({v1: face.a, v2: face.b},
                                      {v1: face.a, v2: face.c});
                } else if (face.b !== edge.v1 && face.b !== edge.v2) {
                    artist.edges.push({v1: face.a, v2: face.b},
                                      {v1: face.b, v2: face.c});
                } else {
                    artist.edges.push({v1: face.a, v2: face.c},
                                      {v1: face.b, v2: face.c});
                }
            },

            findAdjacentFace: function(artist) {
                // use random `artist.edges` to find an adjacent unpainted `face`
                var edge = _.sample(artist.edges);
                var swapper;

                var faceOrSwapCandidates = this.validFace(artist, edge);

                if (_.isArray(faceOrSwapCandidates)) {
                    // pick an existing adjacent and swap in place, updating
                    // face and artist.edges data, and transfer face color
                    swapper = _.sample(swapCandidates);
                    debugger;
                    face.data.artist = artist.name;
                    return {face: face, index: this.faces.indexOf(face), retry: false};
                }

                this.updateFaceAndArtist(faceOrSwapCandidates, artist, edge);

                return {
                    face: faceOrSwapCandidates,
                    index: this.faces.indexOf(faceOrSwapCandidates),
                    retry: true
                };
            },

            nextFace: function(artist, rando) {
                var face = this.faces[rando];

                if (_.isUndefined(face.data.artist)) {
                    // unmarked face
                    if (_.isUndefined(artist.edges)) {
                        face.data.artist = artist.name;
                        artist.edges = [];
                        artist.edges.push({v1: face.a, v2: face.b},
                                          {v1: face.b, v2: face.c},
                                          {v1: face.a, v2: face.c});
                    } else {
                        // artist has been painted somewhere else
                        return this.findAdjacentFace(artist);
                    }
                } else {
                    // shouldn't hit here
                    debugger;
                }

                return {face: face, index: this.faces.indexOf(face), retry: false};
            }
        };

        return facer;
    };
});
