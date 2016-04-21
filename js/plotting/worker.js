'use strict';

/* Manages the seeding of the artists on the globe and batches
 * out further painting based on incoming events
 *
 * After each cycle through painting more faces, the new faces
 * are sent back to the main thread for update.
 */

const { nextArtist, artistsLeft } = require('../artists');
const { faces } = require('../three/globe');
const { nextFaces } = require('./faces');
const { prepareData, seedIndices } = require('./seeder');
const { randomBoundedArray } = require('../helpers');

// WebWorker-wide list of remaining face indices yet to be painted
// TODO: really needed? can be computed/inferred from artists?
self.remaining = [];

// TODO: doesn't belong here
const setNewFaceForArtist = artist => face => {
    face.color.set(artist.color);
    face.data.artist = artist.name;
    face.data.plays = artist.playCount;
    face.data.pending = true;
    artist.faces.push(face);
};

// TODO: rework into generator
const iterate = (remaining = self.remaining) => {
    const artist = nextArtist();
    // no more artists that need to be painted
    if (!artist) return true;

    const newFaces = nextFaces(artist, remaining[0]);
    // no paints on this pass, no use trying again
    if (!newFaces.length) return true;

    const setFace = setNewFaceForArtist(artist);
    newFaces.map(face => {
        const remainingIndex = remaining.indexOf(faces().indexOf(face));
        if (remainingIndex > -1) {
            remaining.splice(remainingIndex, 1);
            console.log('remaining', remaining.length);
        }
        setFace(face);
    });
    return false;
};

const respondWithFaces = (event = 'painted') => {
    const newFaces = faces().reduce((indexed, face) => {
        if (face.data.pending) {
            const { color, data } = face;
            const indexedFace = {
                [faces().indexOf(face).toString()]: { color, data }
            };
            delete face.data.pending;
            indexed.push(indexedFace);
        }
        return indexed;
    }, []);

    // TODO: send back progress
    postMessage({
        type: `faces.${event}`,
        payload: { faces: JSON.stringify(newFaces) }
    });
};

const seed = payload => {
    let data = JSON.parse(payload);

    if (!data.length) {
        // TODO: find a nicer way
        console.error('user has no plays');
        return [];
    }

    // seed the planet
    prepareData(data);
    let seeds = seedIndices();
    seeds.map(s => iterate([s]));

    // set remaining faces to paint
    let randos = randomBoundedArray(0, faces().length - 1);
    self.remaining = randos.filter(r => seeds.indexOf(r) < 0);

    respondWithFaces('seeded');
};

const one = () => {
    iterate();
    respondWithFaces();
};

const batch = () => {
    for (let i = 0; i <= artistsLeft().length; i++) {
        if (iterate()) break;
    }
    respondWithFaces();
};

const all = () => {
    for (let i = 0; i < self.remaining.length; i++) {
        if (batch()) break;
    }
};

module.exports = { seed, one, batch, all };
