const THREE = require('three');
const { normalizeAgainst, spacedColor } = require('helpers');

let artists = [];

const artistForName = name => artists.find(a => a.name === name);

const setArtists = data => {
    const normCount = normalizeAgainst(data.map(d => d.playCount));
    artists = data.map((artist, i) => {
        const weight = normCount(artist.playCount);
        const baseColor = new THREE.Color(spacedColor(data.length, i));
        return Object.assign(artist, { color: baseColor.multiplyScalar(weight), weight });
    });
    return artists;
};

module.exports = {
    artists,
    artistForName,
    setArtists
};
