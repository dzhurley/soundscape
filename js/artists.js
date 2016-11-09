/* Central store for artists and their relationship to the globe.
 *
 * Artists are annotated with app-specific data as follows:
 * {
 *      // from source
 *      name: '',
 *      playCount: 0,
 *
 *      // annotations
 *      color: THREE.Color,
 *      faceLimit: 0
 *      faces: [face, face, ...],
 * }
 *
 * Aside from forceSeeding, artists are strictly used in the plotting
 * worker and need no communication or syncing with the main thread.
 *
 */

// TODO: fold all three.js and local plugins into separate, singular module
const { Color } = require('./lib/HalfEdgeStructure');
const { normalizeAgainst, spacedColor } = require('./helpers');
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

const notDone = artist => artist.faces.length < artist.faceLimit;

const artistsLeft = () => artists().filter(notDone);
const artistForName = name => artists().find(a => a.name === name);

// TODO: rework as generator
const nextArtist = () => {
    // rearrange artists so we start at next index() and wrap through the rest
    const sorted = [...artists().slice(index()), ...artists().slice(0, index())];
    const match = sorted.find(notDone);

    // update index() and return artist if they exist
    const matchedIndex = artists().indexOf(match);
    index(matchedIndex < sorted.length ? matchedIndex + 1 : 0);
    return matchedIndex > -1 ? match : false;
};

// writes

const correctFaceLimits = () => {
    const artistsLength = artists().length;

    let diff = faces().length - artists().reduce((t, a) => t + a.faceLimit, 0);

    if (diff > 0) {
        // we've not quite hit faces().length
        while (diff > 0) {
            for (let i = 0; i < artistsLength; i++) {
                artists()[i].faceLimit += 1;
                if (!--diff) break;
            }
        }
    } else if (diff < 0) {
        // we've gone over and need to pull it back
        while (diff < 0) {
            for (let i = 0; i < artistsLength; i++) {
                artists()[i].faceLimit -= 1;
                if (!++diff) break;
            }
        }
    }
};

const setArtists = data => {
    const totalPlays = data.reduce((m, a) => m + a.playCount, 0);
    const totalFaces = faces().length;

    const normCount = normalizeAgainst(data.map(d => d.playCount));

    artists(data.map((artist, i) => Object.assign(artist, {
        faces: [],
        faceLimit: Math.round(artist.playCount * totalFaces / totalPlays),
        color: new Color(spacedColor(data.length, i)).multiplyScalar(normCount(artist.playCount))
    })));

    // Math.round on each artist doesn't always sum to totalFaces.
    correctFaceLimits();

    // don't bother with artists that don't merit faces
    artists(data.filter(artist => artist.faceLimit > 0));

    index(0);
};

module.exports = {
    artists,
    artistForName,
    artistsLeft,
    nextArtist,
    setArtists
};
