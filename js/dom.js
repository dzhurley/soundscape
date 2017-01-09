// Interface for the DOM around UI event bindings

const autocomplete = require('autocomplete');
const { emit, on } = require('dispatch');
const { intersectObject, qs, qsa } = require('helpers');
const { getCamera } = require('three/camera');
const { globe } = require('three/globe');

const container = qs('#scape');

const bindClicks = buttons => {
    // bind selected click handlers that match existing button.id values
    buttons.map(button => button.addEventListener('click', {
        toggleControls(evt) {
            emit('toggleControls', evt.target.textContent);
        },
        toggleOverlay() {
            let classes = qs('#sourcesOverlay').classList;
            classes.toggle('closed');
            if (!classes.contains('closed')) qs('#username').focus();
        }
    }[button.id]));
};

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

    bindClicks(qsa('#actions button'));

    qs('#sources').addEventListener('submit', evt => {
        evt.preventDefault();
        emit('submitting', qs('#source').value, qs('#username').value);
        return false;
    });

    // clear form and close once we've successfully submitted
    on('submitted', () => {
        qs('#username').value = '';
        qs('#toggleOverlay').click();
    });

    domElement.addEventListener('mousemove', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        qs('#scape').style.cursor = hits.length ? 'pointer' : 'move';
    });

    // show artist info when clicking region on globe
    domElement.addEventListener('click', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        qs('#hud').innerHTML = hits.length ? `<span>${hits[0].face.data.artist}</span>` : '';
    });

    autocomplete.create();
    // reset autocomplete whenever we repaint
    on('painted', autocomplete.update);
};

const bindEvents = domElement => {
    container.appendChild(domElement);
    bindHandlers(domElement);
};

module.exports = { bindEvents, container };
