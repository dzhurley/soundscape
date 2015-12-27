'use strict';

/* Meat of traversal to find the next face to paint for a given artist
 *
 * If this isn't the first paint for an artist, we search through the
 * edges of the existing faces for the artist and try to grow its
 * region. If no edge can immediately be painted, we offload swapping
 * work to Swapper.
 */

const { expandArtistEdges } = require('../artists');
const { faces } = require('../three/globe');
const swapper = require('./swapper');

const validFace = (artist, edge) => {
    let swappers = [];

    let face = faces().filter(f => {
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

    // make sure one of the candidates isn't for the same artist
    return face.length === 1 ? face[0] : swappers.filter(f => f.data.artist !== artist.name);
};

const findAdjacentFace = artist => {
    // use random `artist.edges` to find an adjacent unpainted `face`
    let edges = Array.from(artist.edges);
    let edge;
    let faceOrSwap;

    while (edges.length) {
        edge = edges[Math.floor(Math.random() * edges.length)];
        faceOrSwap = validFace(artist, edge);

        if (!Array.isArray(faceOrSwap)) {
            // found valid face, stop looking for more
            expandArtistEdges(faceOrSwap, artist, edge);
            return {
                face: faceOrSwap,
                index: faces().indexOf(faceOrSwap)
            };
        }

        if (edges.length) {
            // we found a boundary with another artist, but there are more
            // edges available to check, retry with another random edge
            edges.splice(edges.indexOf(edge), 1);
            if (edges.length) continue;
        }

        // handle expanding out to the closest free face out of band
        console.warn('handling swap for', JSON.stringify(faceOrSwap[0].data));

        swapper.handleSwappers(faceOrSwap[0]);

        return {
            // TODO: bad, do something better to return face states
            face: true,
            index: faces().indexOf(faceOrSwap)
        };
    }
};

const nextFace = (artist, rando) => {
    let face = faces()[rando];
    let paintedInfo = { artist };

    if (face.data.artist) return { face: false };

    if (!artist.edges.length) {
        artist.edges.push(
            { v1: face.a, v2: face.b },
            { v1: face.b, v2: face.c },
            { v1: face.a, v2: face.c }
        );
        return { face, index: faces().indexOf(face) };
    }

    // artist has been painted somewhere else
    while (!paintedInfo.face) {
        paintedInfo = findAdjacentFace(paintedInfo.artist);
    }
    return paintedInfo;
};

module.exports = { nextFace };
