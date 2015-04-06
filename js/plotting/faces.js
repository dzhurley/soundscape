let h = require('../helpers');

let THREE = require('../lib/HalfEdgeStructure');
let ArtistManager = require('../artists');

class FacePlotter {
    constructor(mesh) {
        this.mesh = mesh;
        this.faces = this.mesh.geometry.faces;
        this.vertices = this.mesh.geometry.vertices;
    }

    handleSwappers(startFace) {
        let goal = this.mesh.utils.findClosestFreeFace(startFace);
        let currentFace = startFace;
        let candidates = [];
        let path = [currentFace];

        while (currentFace != goal) {
            candidates = HEDS.adjacentFaces(currentFace);
            currentFace = this.mesh.utils.findClosestFace(candidates, goal);
            path.push(currentFace);
        }

        let prevFace;
        path.reverse().forEach((face, index) => {
            prevFace = path[index + 1];
            if (prevFace) {
                // TODO: account for edge info, see expandArtistEdges
                face.data = Object.assign({}, prevFace.data);
                face.color.copy(prevFace.color);
            }
        });

        this.mesh.geometry.colorsNeedUpdate = true;
        return goal;
    }

    validFace(artist, edge) {
        let swappers = [];

        let face = this.faces.filter((f) => {
            let valid = false;

            if (edge.v1 === f.a) {
                valid = edge.v2 === f.b || edge.v2 === f.c;
            } else if (edge.v1 === f.b) {
                valid = edge.v2 === f.a || edge.v2 === f.c;
            } else if (edge.v1 === f.c) {
                valid = edge.v2 === f.a || edge.v2 === f.b;
            }

            if (valid && f.data.artist) {
                // if it's adjacent but taken, remember it in case we
                // don't find a free face so we can swap in place
                swappers.push(f);
                return false;
            }
            return valid;
        });

        if (face.length === 1) {
            return face[0];
        }

        // make sure one of the candidates isn't for the same artist
        let swappersLeft = swappers.filter((f) => f.data.artist !== artist.name)
        return swappersLeft;
    }

    findAdjacentFace(artist) {
        // use random `artist.edges` to find an adjacent unpainted `face`
        let edges = Array.from(artist.edges);
        let edge;
        let faceOrSwap;
        let swappedArtist;

        while (edges.length) {
            edge = edges[Math.floor(Math.random() * edges.length)];
            faceOrSwap = this.validFace(artist, edge);

            if (!Array.isArray(faceOrSwap)) {
                // found valid face, stop looking for more
                ArtistManager.expandArtistEdges(faceOrSwap, artist, edge);
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
    }

    nextFace(artist, rando) {
        let face = this.faces[rando];
        let paintedInfo = {artist: artist};

        if (face.data.artist) {
            return {face: false};
        }

        if (!artist.edges.length) {
            artist.edges.push({v1: face.a, v2: face.b},
                              {v1: face.b, v2: face.c},
                              {v1: face.a, v2: face.c});
            return {face: face, index: this.faces.indexOf(face)};
        }

        // artist has been painted somewhere else
        while (!paintedInfo.face) {
            paintedInfo = this.findAdjacentFace(paintedInfo.artist);
        }
        return paintedInfo;
    }
}

module.exports = FacePlotter;
