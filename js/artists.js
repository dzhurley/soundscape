'use strict';

/* Central store for artists and their relationship to the globe.
 *
 * Artists are annotated with app-specific data as follows:
 * {
 *      color: THREE.Color,
 *      outerBoundaryEdges: [HalfEdge, HalfEdge, ...],
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
 *      plays: 0
 * }
 *
 */

const { Color } = require('./lib/HalfEdgeStructure');
const { spacedColor } = require('./helpers');
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

module.exports = {
    artists,
    artistsLeft,
    nextArtist,
    setArtists
};
