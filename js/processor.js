define([
    'underscore',
    'helpers',
    'three'
], function(_, h, THREE) {
    var artist;
    var artistInfo;
    var face;
    var faces;
    var faceInfo;
    var nextArtistCallCount = 0;
    var totalArtists;
    var vertices;

    var nextArtist = function(artistIndex, data) {
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
            return nextArtist(artistIndex + 1, data);
        }
        // log that this artist painted a face
        artist.faces--;
        // set up next call for next artist
        artistIndex++;
        // reset recursive logging
        nextArtistCallCount = 0;
        return {
            artist: artist,
            currentArtistIndex: artistIndex
        };
    };

    var nextFace = function(artist, rando) {
        face = faces[rando];
        var savedRando = false;

        function findAdjacentFace(artist) {
            // use first `artist.edges` to find an adjacent unpainted `face`
            var edge = artist.edges[0];
            var possibleFaces = _.filter(faces, function(f) {
                var valid = false;
                if (f.a === edge.v1) {
                    valid = f.b === edge.v2 || f.c === edge.v2;
                } else if (f.b === edge.v1) {
                    valid = f.a === edge.v2 || f.c === edge.v2;
                } else if (f.c === edge.v1) {
                    valid = f.a === edge.v2 || f.b === edge.v2;
                }

                // make sure `face` hasn't been painted yet
                return valid ? _.isUndefined(f.data.artist) : valid;
            });

            if (!possibleFaces.length) {
                // this feels like a pain point
                face.data.artist = artist.name;
                savedRando = rando;
                return;
            }

            // update `face` and `artist.edges`
            face = _.sample(possibleFaces);
            face.data.artist = artist.name;
            artist.edges.shift(edge);
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

            // keep `rando` around for next `runLoop`
            savedRando = rando;
        }

        if (_.isUndefined(face.data.artist)) {
            if (_.isUndefined(artist.edges)) {
                face.data.artist = artist.name;
                artist.edges = [];
                artist.edges.push({v1: face.a, v2: face.b},
                                  {v1: face.b, v2: face.c},
                                  {v1: face.a, v2: face.c});
            } else {
                findAdjacentFace(artist);
            }
        } else if (face.data.artist === artist.name) {
            findAdjacentFace(artist);
        } else {
            face = false;
        }

        return {
            face: face,
            savedRando: savedRando
        };
    };

    var setFace = function(face, artistIndex, artist) {
        if (!face) {
            return;
        }
        // paint face with artist color and info
        face.color.setHex(h.spacedColor(totalArtists, artistIndex));
        face.color.multiplyScalar(artist.normCount);
        face.data.plays = artist.playCount;
        App.mesh.update();
    };

    var runLoop = function(artistIndex, data, randos) {
        var savedRandos = [];

        function loopLogic(i) {
            // choose random face for each face to paint
            artistInfo = nextArtist(artistIndex, data);
            if (!artistInfo) {
                // no more faces left for any artist to paint
                return;
            }
            artistIndex = artistInfo.currentArtistIndex;
            faceInfo = nextFace(artist, randos[i]);
            if (faceInfo.savedRando) {
                savedRandos.push(faceInfo.savedRando);
            }
            setFace(faceInfo.face, artistIndex, artistInfo.artist);
        }

        if (App.watchItPaint) {
            (function myLoop (i) {
                // watch it paint each face
                loopLogic(i);
                setTimeout(function () {
                    if (--i) myLoop(i);
                }, 0);
            })(randos.length - 1);
        } else {
            for(var i in randos) {
                loopLogic(i);
            }
        }

        return savedRandos.length ? runLoop(artistIndex, data, savedRandos) : false;
    };

    var updateFaces = function(data) {
        var artistIndex = 0;
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

        runLoop(artistIndex, data, randos);
    };

    return {
        process: function(data) {
            faces = App.mesh.globe.geometry.faces;
            vertices = App.mesh.globe.geometry.vertices;
            totalArtists = data.length;
            updateFaces(data);
            App.mesh.update();
        }
    };
});
