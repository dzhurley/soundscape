'use strict';

/* Interface for the DOM around UI event bindings */

const { emit, emitOnWorker, on, once } = require('./dispatch');
const HUD = require('./hud');
const { currentLabs, isActive, isPending, toggleLab } = require('./labs');

const withId = s => document.getElementById(s);
const container = withId('scape');

const handleLabUpdate = button => {
    const labUpdates = {
        iterateControl(state) {
            updateLabButtonState(button);
            let buttons = Array.from(document.querySelectorAll('[data-lab=iterateControl]'));
            buttons.map(b => b.style.display = state ? 'inline-block' : 'none');
        }
    };
    button.id in labUpdates && labUpdates[button.id](button.dataset.active === 'true');
};

const updateLabButtonState = b => Object.assign(b.dataset, {
    inactive: !isActive(b.id, b.parentElement.id),
    pending: isPending(b.id, b.parentElement.id),
    active: isActive(b.id, b.parentElement.id)
});

const bindLabs = () => {
    let labs = currentLabs();
    withId('labs').innerHTML = Object.keys(labs).reduce((m, type) => {
        let keyed = Object.keys(labs[type]).reduce((m, key) => {
            return m + `<button id="${key}"
                                data-inactive="${!isActive(key, type)}"
                                data-pending="${isPending(key, type)}"
                                data-active="${isActive(key, type)}">
                            ${key}
                        </button>`;
        }, '');
        return m + `<section id="${type}">${keyed}</section>`;
    }, '');

    let buttons = Array.from(withId('labs').querySelectorAll('button'));

    buttons.map(handleLabUpdate);

    buttons.map(b => b.addEventListener('click', e => {
        toggleLab(e.target.id, e.target.parentElement.id);
        handleLabUpdate(e.target);
    }));

    // listen for events that match trigger buttons to update from pending to active
    buttons.map(b => once(`triggered`, lab => b.id === lab && updateLabButtonState(b)));
};

const bindHandlers = () => {
    let buttons = Array.from(withId('actions').querySelectorAll('button'));
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

    withId('sources').addEventListener('submit', evt => emit('submitting', evt));

    on('submitted', () => {
        withId('username').value = '';
        withId('toggleOverlay').click();
    });
};

const attachWebGLement = el => {
    container.appendChild(el);
    bindLabs();
    bindHandlers();
    HUD.bindHandlers(container);
};

module.exports = { attachWebGLement, container };
