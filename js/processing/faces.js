define([
    'underscore',
    'helpers',
    'three'
], function(_, h, THREE) {
    var artist;
    var artistIndex = 0;
    var artistInfo;
    var face;
    var faceInfo;
    var faces;
    var nextArtistCallCount = 0;
    var paintedFaces = [];
    var retry = false;
    var totalArtists;
    var vertices;

    var nextArtist = function(data) {
        // rollover to beginning of artists
        if (artistIndex === totalArtists) {
            artistIndex = 0;
        }
        artist = data[artistIndex];
        if (artist.faces === 0) {
            if (nextArtistCallCount === totalArtists) {
                // when we've recursed to confirm every `artist.faces` is 0,
                // we are done painting and return
                return false;
            }
            // if there aren't any faces left to paint for this artist, check
            // the next artist and record how far we've recursed
            nextArtistCallCount++;
            artistIndex++;
            return nextArtist(data);
        }
        // log that this artist painted a face
        artist.faces--;
        // set up next call for next artist
        artistIndex++;
        // reset recursive logging
        nextArtistCallCount = 0;
        return artist;
    };

    var nextFace = function(artist, rando) {
        var retry = false;
        face = faces[rando];

        function findAdjacentFace(artist) {
            // use random `artist.edges` to find an adjacent unpainted `face`
            var edge = _.sample(artist.edges);
            var swapCandidates = [];
            var swapper;

            face = _.find(faces, function(f) {
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

            if (!face) {
                // pick an existing adjacent and swap in place, updating
                // face and artist.edges data, and transfer face color
                swapper = _.sample(swapCandidates);
                debugger;
                face.data.artist = artist.name;
                return face;
            }

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
            retry = true;
            return face;
        }

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
                face = findAdjacentFace(artist);
            }
        } else {
            // shouldn't hit here
            debugger;
        }

        return {face: face, retry: retry};
    };

    var setFace = function(face, artist) {
        if (!face) {
            return;
        }
        // paint face with artist color and info
        face.color.setHex(h.spacedColor(totalArtists, artistIndex));
        face.color.multiplyScalar(artist.normCount);
        face.data.plays = artist.playCount;
        App.mesh.update();
    };

    var runLoop = function(rando, data, randos) {
        if (_.contains(paintedFaces, rando)) {
            return false;
        }
        // choose random face for each face to paint
        artist = nextArtist(data);
        if (!artist) {
            // no more faces left for any artist to paint
            return false;
        }
        faceInfo = nextFace(artist, rando);
        paintedFaces.push(faces.indexOf(faceInfo.face));
        setFace(faceInfo.face, artist);

        if (faceInfo.retry) {
            return runLoop(rando, data, randos);
        }
    };

    var updateFaces = function(data) {
        var randos = h.randomBoundedArray(0, faces.length - 1);

        _.map(faces, function(face) {
            face.data = {};
        });

        var totalPlays = _.reduce(data, function(memo, d) {
            return memo + d.playCount;
        }, 0);

        _.map(data, function(artist) {
            // faces available for a given artist to paint
            artist.faces = Math.round(artist.playCount * faces.length / totalPlays);
            return artist;
        });

        for(var i in randos) {
            runLoop(randos[i], data, randos);
        }
    };

    return function() {
        return {
            process: function(data) {
                faces = App.mesh.globe.geometry.faces;
                vertices = App.mesh.globe.geometry.vertices;
                totalArtists = data.length;
                updateFaces(data);
                App.mesh.update();
            }
        };
    };
});
