define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene'
], function(_, h, THREE, scene) {
    return function(artister, mesh, edger) {
        var facer = {
            init: function() {
                this.edger = edger;
                this.mesh = mesh;
                this.faces = this.mesh.geometry.faces;
                this.vertices = this.mesh.geometry.vertices;
                this.artister = artister;
            },

            addEquidistantMarks: function(num) {
                if (this.markers && this.markers.length) {
                    // TODO: check on scene addition/removal?
                    return this.markers;
                }
                this.markers = [];
                var mark;
                var points = h.equidistantishPointsOnSphere(num);

                for (var i in points) {
                    mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
                    mark.position.x = points[i][0];
                    mark.position.y = points[i][1];
                    mark.position.z = points[i][2];
                    mark.position.multiplyScalar(this.mesh.geometry.radius + 2);
                    this.markers.push(mark);
                    scene.add(mark);
                }
            },

            findEquidistantFaces: function(numMarkers) {
                // add transient helper marks
                this.addEquidistantMarks(numMarkers);

                var caster = new THREE.Raycaster();
                var intersectingFaces = [];
                var marker;
                for (var i = 0; i < this.markers.length; i++) {
                    // use the mark's vector as a ray to find the closest face
                    // via its intersection
                    marker = this.markers[i].position.clone();
                    caster.set(this.mesh.position, marker.normalize());
                    intersectingFaces.push(caster.intersectObject(this.mesh));
                }

                // clean up transient markers
                _.each(this.markers, function(mark) {
                    scene.remove(mark);
                });
                delete this.markers;

                return _.map(intersectingFaces, function(hit) {
                    // return at most one face for each intersection
                    return hit[0];
                });
            },

            validFace: function(artist, edge) {
                var swappers = [];
                var verts = this.edger.generalEdge(edge);

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

            findAdjacentFace: function(artist) {
                // use random `artist.edges` to find an adjacent unpainted `face`
                var edges = _.clone(artist.edges);
                var edge;
                var faceOrSwap;
                var swappedArtist;

                while (edges.length) {
                    edge = _.sample(edges);
                    faceOrSwap = this.validFace(artist, edge);

                    if (!_.isArray(faceOrSwap)) {
                        // found valid face, stop looking for more
                        this.artister.expandArtistEdges(faceOrSwap, artist, edge);
                        return {
                            face: faceOrSwap,
                            index: this.faces.indexOf(faceOrSwap)
                        };
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
                    swappedArtist = faceOrSwap.data.artist;

                    if (_.contains(this.recentlySwappedArtists, faceOrSwap.data.artist)) {
                        // don't immediately backtrack when swapping, try another round
                        edges = _.clone(artist.edges);
                        continue;
                    }

                    console.log(artist.name, 'swapping with', swappedArtist);
                    App.vent.trigger('painted.face', faceOrSwap);

                    if (App.stopOnSwap) {
                        App.stopLooping = true;
                        return {face: false};
                    }

                    this.artister.expandArtistEdges(faceOrSwap, artist, edge);

                    // call directly so it won't get dropped while searching for a free face
                    App.processor.looper.setFace(faceOrSwap, artist);

                    if (this.recentlySwappedArtists.length === 2) {
                        // only keep track of the last 2 artists swapped to help guide us
                        // without boxing us into a corner
                        this.recentlySwappedArtists.shift();
                    }
                    this.recentlySwappedArtists.push(artist.name);

                    // bounce back to call findAdjacentFace again with swapped artist
                    return {
                        artist: _.findWhere(this.artister.artists,
                                            {name: swappedArtist})
                    };
                }
            },

            nextFace: function(artist, rando) {
                this.recentlySwappedArtists = [];
                var face = this.faces[rando];
                var paintedInfo = {artist: artist};

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
                while (!_.has(paintedInfo, 'face')) {
                    paintedInfo = this.findAdjacentFace(paintedInfo.artist);
                }
                return paintedInfo;
            }
        };

        facer.init();
        return facer;
    };
});
