const { lastfmToken, storageKeys } = require('constants');
const { on } = require('dispatch');
const { packUrlParams } = require('helpers');

const artistInfo = new Map();

// TODO: port back to sources?
const url = {
    base: 'https://ws.audioscrobbler.com/2.0/',
    params: {
        'api_key': lastfmToken,
        'format': 'json',
        'method': 'artist.getinfo',
        'artist': ''
    }
};

const parseImg = item => {
    if (!item) return '';
    const image = new window.Image();
    // setting source here triggers browser to fetch image contents
    image.src = item['#text'];
    return image.src;
};

// TODO: handle similar for future exploration
// TODO: handle ontour
const parseInfo = json => ({
    // trim 'read more' links and disclaimers injected by last.fm
    bio: json.artist.bio.content.replace(/ <a.*/, ''),
    loaded: true,
    image: parseImg(json.artist.image.find(img => img.size === 'extralarge')),
    name: json.artist.name,
    ontour: !!parseInt(json.artist.ontour, 10),
    similar: json.artist.similar.artist.map(artist => artist.name),
    tags: json.artist.tags.tag,
    url: json.artist.url
});

const requestInfo = name => {
    const params = Object.assign({}, url.params, { artist: name });
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', packUrlParams(url.base, params), true);
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject('invalid response', request.responseText);
            }
        };
        request.send();
    });
};

const updateInfo = artists => {
    artistInfo.clear();
    JSON.parse(artists).map(artist => {
        artistInfo.set(artist.name, { loaded: false });

        // rely on localStorage whenever possible
        const key = storageKeys.artist(artist.name);
        if (Object.keys(localStorage).indexOf(key) > -1) {
            const parsed = JSON.parse(localStorage[key]);
            if (parsed.loaded) {
                artistInfo.set(artist.name, parsed);
                return;
            }
        }

        requestInfo(artist.name)
            .then(parseInfo)
            .then(info => {
                artistInfo.set(artist.name, info);
                localStorage[key] = JSON.stringify(info);
            });
    });
};

const renderInfo = artist => {
    const info = artistInfo.get(artist);

    if (!info || !info.loaded) return `<span>artist: ${artist}</span>`;

    return `
<a target="_blank" href="${info.url}"><img class="artist-info-image" src="${info.image}" /></a>
<h1 class="artist-info-name"><a target="_blank" href="${info.url}">${info.name}</a></h1>
<ul class="artist-info-tags">
${info.tags.map(tag => `  <li><a target="_blank" href="${tag.url}">${tag.name}</a></li>`).join('\n')}
</ul>
<p class="artist-info-bio">${info.bio}</p>
`;
};

on('submitted', updateInfo);

module.exports = { renderInfo };
