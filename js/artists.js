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

const THREE = require('./lib/HalfEdgeStructure');
const { spacedColor } = require('./helpers');
const { on } = require('./dispatch');

// TODO: find better state solution (localStorage alongside sources?)
let artistStore = {
    index: 0,
    artists: []
};

// reads

const artists = () => artistStore.artists;
const index = () => artistStore.index;

const numArtistsLeft = () => artists().reduce((m, a) => m + (a.faces ? 1 : 0), 0);

const edgesForArtist = n => artists().filter(a => a.name === n).map(a => a.edges).shift();

const nextArtist = () => {
    let artist;

    function findArtist(currentIndex, artists, call=0) {
        // rollover to beginning of artists
        if (currentIndex === artists.length) {
            currentIndex = 0;
        }
        artist = artists[currentIndex];
        if (artist.faces === 0) {
            if (call === artists.length) {
                // when we've recursed to confirm every `artist.faces` is 0,
                // we are done painting and return
                return [false, currentIndex];
            }
            // if there aren't any faces left to paint for this artist,
            // look towards the next artist and record how far we've recursed
            currentIndex++;
            call++;
            return findArtist(currentIndex, artists, call);
        }

        return [artist, currentIndex + 1];
    }

    [artist, artistStore.index] = findArtist(index(), artists());
    return artist;
};

// writes

const setArtists = ({ artists, totalFaces }) => {
    let totalPlays = artists.reduce((m, a) => m + a.playCount, 0);

    artists.map((artist, i) => {
        artist.edges = [];

        // faces available for a given artist to paint
        artist.faces = Math.floor(artist.playCount * totalFaces / totalPlays);

        // color generated from rank
        artist.color = new THREE.Color(spacedColor(artists.length, i));
        artist.color.multiplyScalar(artist.normCount);

        return artist;
    });

    // don't bother with artists that don't merit faces
    artistStore.artists = artists.filter(artist => artist.faces > 0);
    artistStore.index = 0;
};

on('getArtists', () => postMessage({
    type: 'updateArtists',
    payload: {
        artists: JSON.stringify(artists() || []),
        index: index()
    }
}));

on('updateArtists', ({ artists, index }) => {
    artistStore.artists = JSON.parse(artists);
    artistStore.index = index;
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
    numArtistsLeft,
    edgesForArtist,
    expandArtistEdges,
    nextArtist,
    setArtists
};
