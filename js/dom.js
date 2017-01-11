// Interface for the DOM around UI event bindings

const search = require('search');
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

const bindForm = () => {
    const input = qs('.user-form-username');
    const error = qs('.user-form-error');
    let used = false;
    let lastUser = '';

    qs('.user-form').addEventListener('submit', evt => {
        evt.preventDefault();
        error.textContent = '';
        emit('submitting', input.value);
        return false;
    });

    qs('#scape').addEventListener('click', () => input.blur());

    input.addEventListener('focus', () => {
        if (used) input.value = '';
        error.textContent = '';
        error.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        if (used) input.value = lastUser;
        error.style.display = 'none';
    });

    on('submitted', () => {
        used = true;
        lastUser = input.value;
        input.blur();
        qs('.search').style.display = 'block';
    });

    on('formError', (message, ...args) => {
        console.error(`thrown: ${message}`, args);
        error.textContent = message;
    });
};

const bindHandlers = domElement => {
    bindAbout();

    bindForm();

    domElement.addEventListener('mousemove', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        qs('#scape').style.cursor = hits.length ? 'pointer' : 'move';
    });

    // show artist info when clicking region on globe
    domElement.addEventListener('click', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        qs('.artist-info').innerHTML = hits.length ?
            `<span>artist: ${hits[0].face.data.artist}</span>` :
            '';
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
