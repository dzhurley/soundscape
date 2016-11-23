/* Interface for the DOM around UI event bindings */

const { intersectObject, qs, qsa } = require('helpers');
const bindAutocomplete = require('autocomplete');
const { emit, on } = require('dispatch');
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

const bindHandlers = domElement => {
    bindClicks(qsa('#actions button'));

    qs('#sources').addEventListener('submit', evt => {
        evt.preventDefault();
        emit('submitting', qs('#source').value, qs('#username').value);
        return false;
    });

    on('submitted', () => {
        qs('#username').value = '';
        qs('#toggleOverlay').click();
    });

    on('painted', () => {
        domElement.addEventListener('mousemove', evt => {
            const hits = intersectObject(evt, globe, getCamera());
            qs('#scape').style.cursor = hits.length ? 'pointer' : 'move';
        });

        domElement.addEventListener('click', evt => {
            const hits = intersectObject(evt, globe, getCamera());
            qs('#hud').innerHTML = hits.length ? `<span>${hits[0].face.data.artist}</span>` : '';
        });

        bindAutocomplete();
    });
};

const bindEvents = domElement => {
    container.appendChild(domElement);
    bindHandlers(domElement);
};

module.exports = { bindEvents, container };
