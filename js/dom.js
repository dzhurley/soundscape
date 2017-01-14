// Interface for the DOM around UI event bindings

const { renderInfo } = require('artists/info');
const { emit } = require('dispatch');
const form = require('form');
const { intersectObject, qs } = require('helpers');
const search = require('search');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');

const container = qs('#scape');

const bindAbout = () => {
    let isOpen = false;
    ['.about-close', '.about-toggle'].map(el => qs(el).addEventListener('click', evt => {
        evt.preventDefault();
        isOpen = !isOpen;
        document.querySelector('.about').style.display = isOpen ? 'block' : '';
    }, false));
};

const bindHandlers = domElement => {
    bindAbout();

    form.create();

    domElement.addEventListener('mousemove', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        qs('#scape').style.cursor = hits.length ? 'pointer' : 'move';
    });

    // show artist info when clicking region on globe
    domElement.addEventListener('click', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        const artist = qs('.artist-info');

        if (hits.length && hits[0].face.data.artist) {
            artist.innerHTML = renderInfo(hits[0].face.data.artist);
            artist.style.display = 'flex';
        } else {
            artist.innerHTML = '';
            artist.style.display = 'none';
        }
    });

    // on key 'c', toggle controls between orbital and fly
    // TODO: tell user about this
    window.addEventListener('keyup', evt => {
        // ensure we only trigger on 'c' when not in an input
        if (evt.target.nodeName !== 'INPUT' && evt.keyCode === 67) emit('controls');
    });

    search.create();
};

const bindEvents = domElement => {
    container.appendChild(domElement);
    bindHandlers(domElement);
};

module.exports = { bindEvents, container };
