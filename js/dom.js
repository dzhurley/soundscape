/* Interface for the DOM around UI event bindings */

const { faceCentroid, intersectObject, withId } = require('helpers');
const { emit, emitOnWorker, on } = require('dispatch');
const { getCamera } = require('three/camera');
const { faces, globe } = require('three/globe');

const container = withId('scape');

const bindClicks = buttons => {
    // bind selected click handlers that match existing button.id values
    buttons.map(button => button.addEventListener('click', {
        toggleControls(evt) {
            emit('toggleControls', evt.target.textContent);
        },
        toggleOverlay() {
            let classes = withId('sourcesOverlay').classList;
            classes.toggle('closed');
            if (!classes.contains('closed')) withId('username').focus();
        },

        one() {
            emitOnWorker('plot.one');
        },
        batch() {
            emitOnWorker('plot.batch');
        },
        all() {
            emitOnWorker('plot.all');
        }
    }[button.id]));
};

const bindHandlers = domElement => {
    bindClicks(Array.from(withId('actions').querySelectorAll('button')));

    withId('sources').addEventListener('submit', evt => emit('submitting', evt));

    // TODO: make autocomplete?
    withId('actions').querySelector('input').addEventListener('keyup', evt => {
        const { keyCode, currentTarget: { value } } = evt;
        if (keyCode === 13) {
            const cam = getCamera();
            const match = faces().find(
                f => (f.data.artist || '').toLowerCase() === value.toLowerCase()
            );
            // TODO: add Tweens
            cam.position.copy(faceCentroid(globe, match).setLength(cam.position.length()));
            cam.lookAt(globe);
        }
    });

    domElement.addEventListener('click', evt => {
        const hits = intersectObject(evt, globe, getCamera());
        withId('hud').innerHTML = hits.length ?
            `<span>${hits[0].face.data.artist}: ${hits[0].face.data.plays} play(s)</span>` :
            '';
    });

    on('submitted', () => {
        withId('username').value = '';
        withId('toggleOverlay').click();
    });
};

const bindEvents = domElement => {
    container.appendChild(domElement);
    bindHandlers(domElement);
};

module.exports = { bindEvents, container };
