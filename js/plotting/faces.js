var _ = require('underscore');
var THREE = require('three');

var h = require('../helpers');

var facePlotter = function(mesh) {
    this.mesh = mesh;
    this.faces = this.mesh.geometry.faces;
    this.vertices = this.mesh.geometry.vertices;
};

facePlotter.prototype = {
    handleSwappers: function(startFace) {
        var goal = this.mesh.utils.findClosestFreeFace(startFace);
        var currentFace = startFace;
        var candidates = [];
        var path = [currentFace];

        while (currentFace != goal) {
            candidates = App.heds.adjacentFaces(currentFace);
            currentFace = this.mesh.utils.findClosestFace(candidates, goal);
            path.push(currentFace);
        }

        var prevFace;
        _.each(path.reverse(), function(face, index) {
            prevFace = path[index + 1];
            if (prevFace) {
                // TODO: account for edge info, see expandArtistEdges
                face.data = _.clone(prevFace.data);
                face.color.copy(prevFace.color);
            }
        });

        this.mesh.geometry.colorsNeedUpdate = true;
        return goal;
    },

    validFace: function(artist, edge) {
        var swappers = [];

        function intertains(first, second) {
            return !_.isEmpty(_.intersection(first, second));
        }

        var face = _.filter(this.faces, function(f) {
            var valid = false;

            if (edge.v1 === f.a) {
                valid = edge.v2 === f.b || edge.v2 === f.c;
            } else if (edge.v1 === f.b) {
                valid = edge.v2 === f.a || edge.v2 === f.c;
            } else if (edge.v1 === f.c) {
                valid = edge.v2 === f.a || edge.v2 === f.b;
            }

            if (valid && !_.isUndefined(f.data.artist)) {
                // if it's adjacent but taken, remember it in case we
                // don't find a free face so we can swap in place
                swappers.push(f);
                return false;
            }
            return valid;
        }.bind(this));

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
                App.artistManager.expandArtistEdges(faceOrSwap, artist, edge);
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

            // handle expanding out to the closest free face out of band
            console.warn('handling swap for', JSON.stringify(faceOrSwap[0].data));
            this.handleSwappers(faceOrSwap[0]);
            return {
                // TODO: bad, do something better to return face states
                face: true,
                index: this.faces.indexOf(faceOrSwap)
            };
        }
    },

    nextFace: function(artist, rando) {
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

module.exports = facePlotter;
