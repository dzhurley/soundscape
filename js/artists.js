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

const h = require('./helpers');
const THREE = require('./lib/HalfEdgeStructure');

const Dispatch = require('./dispatch');

class ArtistManager {
    constructor() {
        this.artistIndex = 0;
        Dispatch.on('getArtists', this.getArtists.bind(this));
        Dispatch.on('updateArtists', this.updateArtists.bind(this));
    }

    artistsLeft() {
        return this.artists.reduce((memo, artist) => memo + (artist.faces ? 1 : 0), 0);
    }

    edgesForArtist(artistName) {
        let artist = this.artists.filter(artist => artist.name === artistName);
        return artist.length && artist[0].edges;
    }

    processArtists(artists) {
        let totalPlays = artists.reduce((memo, artist) => memo + artist.playCount, 0);

        artists.map((artist, i) => {
            artist.edges = [];

            // faces available for a given artist to paint
            artist.faces = Math.floor(artist.playCount * this.totalFaces / totalPlays);

            // color generated from rank
            artist.color = new THREE.Color(h.spacedColor(artists.length, i));
            artist.color.multiplyScalar(artist.normCount);

            return artist;
        });

        // don't bother with artists that don't merit faces
        return artists.filter(artist => artist.faces > 0);
    }

    getArtists() {
        postMessage({
            type: 'updateArtists',
            payload: {
                artists: JSON.stringify(this.artists || []),
                artistIndex: this.artistIndex
            }
        });
    }

    updateArtists(payload) {
        this.artists = JSON.parse(payload.artists);
        this.artistIndex = payload.artistIndex;
    }

    setArtists(payload) {
        this.totalFaces = payload.totalFaces;
        this.artists = this.processArtists(payload.artists);
        this.artistIndex = 0;
    }

    // TODO: rework in entirety, and most likely move
    expandArtistEdges(face, artist, edge) {
        let second;
        let third;

        // find the other sides of the face that we'll overtake
        artist.edges.splice(artist.edges.indexOf(edge), 1);
        if (self.HEDS.isSameEdge(edge, { v1: face.a, v2: face.b })) {
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
    }

    nextArtist() {
        let artist;

        function findArtist(index, artists, call=0) {
            // rollover to beginning of artists
            if (index === artists.length) {
                index = 0;
            }
            artist = artists[index];
            if (artist.faces === 0) {
                if (call === artists.length) {
                    // when we've recursed to confirm every `artist.faces` is 0,
                    // we are done painting and return
                    return [false, index];
                }
                // if there aren't any faces left to paint for this artist,
                // look towards the next artist and record how far we've recursed
                index++;
                call++;
                return findArtist(index, artists, call);
            }

            return [artist, index + 1];
        }

        [artist, this.artistIndex] = findArtist(this.artistIndex, this.artists);
        return artist;
    }
}

module.exports = new ArtistManager();
