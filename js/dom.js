// Interface for the DOM around UI event bindings

const search = require('search');
const form = require('form');
const { emit, on } = require('dispatch');
const { intersectObject, qs } = require('helpers');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');

const container = qs('#scape');

// TODO: collect nicer with other bindings?
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

        if (hits.length) {
            artist.innerHTML = `<span>artist: ${hits[0].face.data.artist}</span>`;
            artist.style.display = 'flex';
        } else {
            artist.innerHTML = '';
            artist.style.display = 'none';
        }
    });

    // on key 'c', toggle controls between orbital and fly
    window.addEventListener('keyup', evt => {
        // ensure we only trigger on 'c' when not in an input
        if (evt.target.nodeName !== 'INPUT' && evt.keyCode === 67) emit('controls');
    });

    search.create();
    // reset search whenever we repaint
    on('painted', search.update);
};

const bindEvents = domElement => {
    container.appendChild(domElement);
    bindHandlers(domElement);
};

module.exports = { bindEvents, container };
