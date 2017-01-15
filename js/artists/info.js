const { on } = require('dispatch');
const { qs } = require('helpers');

const { artistInfo, updateInfo } = require('artists/data');

const node = qs('.artist-info');
const showInfo = info => {
    node.innerHTML = info;
    node.style.display = 'flex';
};
const hideInfo = () => {
    node.innerHTML = '';
    node.style.display = 'none';
};

const renderInfo = artist => {
    if (!artist) return hideInfo();

    const info = artistInfo.get(artist);
    if (!info || !info.loaded) return showInfo(`<span>artist: ${artist}</span>`);

    return showInfo(`
${info.ontour ? '<span class="artist-info-ontour">on tour</span>' : ''}
<a target="_blank" href="${info.url}"><img class="artist-info-image" src="${info.image}" /></a>
<h1 class="artist-info-name"><a target="_blank" href="${info.url}">${info.name}</a></h1>
<ul class="artist-info-tags">
${info.tags.map(tag => `  <li><a target="_blank" href="${tag.url}">${tag.name}</a></li>`).join('\n')}
</ul>
<p class="artist-info-bio">${info.bio}</p>
    `);
};

on('submitted', artists => {
    hideInfo();
    updateInfo(artists);
});

module.exports = { renderInfo };
