'use strict';

/* Central store for artists and their relationship to the globe.
 *
 * Artists are annotated with app-specific data as follows:
 * {
 *      color: THREE.Color,
 *      edges: [{v1:0, v2:0}, ...],
 *      faces: 0,  // count of faces remaining for artist
 *      name: '',
 *      playCount: 0
 * }
 *
 * This helps manage interactions with edges of artist territories
 * and synchronizing artist state between main and worker threads.
 *
 * TODO: rework to following format:
 * {
 *      color: THREE.Color,
 *      faces: [faceIndex, faceIndex, ...],
 *      name: '',
 *      outerBoundaryEdges: [HalfEdge, HalfEdge, ...],
 *      plays: 0
 * }
 *
 */

const { Color } = require('./lib/HalfEdgeStructure');
const { spacedColor } = require('./helpers');
const { on } = require('./dispatch');
const { faces } = require('./three/globe');

// TODO: find better state solution (localStorage alongside sources?)
let artistStore = {
    index: 0,
    artists: []
};

const accessStore = key => val => val ? artistStore[key] = val : artistStore[key];
const artists = accessStore('artists');
const index = accessStore('index');

// reads

const artistsLeft = () => artists().filter(a => a.faces > 0);

const edgesForArtist = n => artists().filter(a => a.name === n).map(a => a.edges).shift();

const nextArtist = () => {
    // rearrange artists so we start at next index() and wrap through the rest
    const sorted = [...artists().slice(index()), ...artists().slice(0, index())];
    const match = sorted.find(a => a.faces > 0);

    // update index() and return artist if they exist
    const matchedIndex = artists().indexOf(match);
    index(matchedIndex < sorted.length ? matchedIndex + 1 : 0);
    return matchedIndex > -1 ? match : false;
};

// writes

const setArtists = data => {
    const totalPlays = data.reduce((m, a) => m + a.playCount, 0);
    const totalFaces = faces().length;

    data.map((artist, i) => {
        artist.edges = [];

        // faces available for a given artist to paint
        artist.faces = Math.floor(artist.playCount * totalFaces / totalPlays);

        // color generated from rank
        artist.color = new Color(spacedColor(data.length, i));
        artist.color.multiplyScalar(artist.normCount);

        return artist;
    });

    // don't bother with artists that don't merit faces
    artists(data.filter(artist => artist.faces > 0));
    index(0);
};

on('getArtists', () => postMessage({
    type: 'updateArtists',
    payload: {
        newArtists: JSON.stringify(artists() || []),
        newIndex: index()
    }
}));

on('updateArtists', ({ newArtists, newIndex }) => {
    artists(JSON.parse(newArtists));
    index(newIndex);
});

// TODO: rework in entirety, and most likely move
const expandArtistEdges = (face, artist, edge) => {
    let second;
    let third;

    // find the other sides of the face that we'll overtake
    artist.edges.splice(artist.edges.indexOf(edge), 1);
    if (self.HEDS.isSameEdge(edge, { v1: face.a, v2: face.b })) {
        second = { v1: face.a, v2: face.c };
        third = { v1: face.b, v2: face.c };
    } else if (self.HEDS.isSameEdge(edge, { v1: face.a, v2: face.c })) {
        second = { v1: face.a, v2: face.b };
        third = { v1: face.b, v2: face.c };
    } else {
        second = { v1: face.a, v2: face.b };
        third = { v1: face.a, v2: face.c };
    }

    artist.edges.push(second, third);

    // TODO: handle swapping
};

module.exports = {
    artists,
    artistsLeft,
    edgesForArtist,
    expandArtistEdges,
    nextArtist,
    setArtists
};
