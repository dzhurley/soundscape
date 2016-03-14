'use strict';

/* Interface for the DOM around UI event bindings */

const { withId } = require('./helpers');
const { emit, emitOnWorker, on } = require('./dispatch');
const HUD = require('./hud');
const { currentLabs, isActive, isPending, toggleLab } = require('./labs');

const container = withId('scape');

const handleLabUpdate = button => {
    const updates = {
        iterateControl(active) {
            let buttons = Array.from(document.querySelectorAll('[data-lab=iterateControl]'));
            buttons.map(b => b.style.display = active ? 'inline-block' : 'none');
        }
    };

    updateLabButtonState(button);
    const { dataset: { active } } = button;
    if (button.id in updates) updates[button.id](active === 'true');
};

const updateLabButtonState = b => Object.assign(b.dataset, {
    inactive: !isActive(b.id, b.parentElement.id),
    pending: isPending(b.id, b.parentElement.id),
    active: isActive(b.id, b.parentElement.id)
});

const bindLabs = () => {
    withId('labs').innerHTML = currentLabs().reduce((m, l) => {
        return m + `<button id="${l.name}"
                            data-inactive="${!isActive(l.name)}"
                            data-pending="${isPending(l.name)}"
                            data-active="${isActive(l.name)}">
                        ${l.name}
                    </button>`;
    }, '');

    let buttons = Array.from(withId('labs').querySelectorAll('button'));

    // set initial button state
    buttons.map(handleLabUpdate);
    buttons.map(b => b.addEventListener('click', e => {
        toggleLab(e.target.id, e.target.parentElement.id);
        handleLabUpdate(e.target);
    }));
    // listen for events that match trigger labs to update buttons
    buttons.map(b => on('lab.trigger', lab => {
        if (b.id === lab.name) updateLabButtonState(b);
    }));

};

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

const bindHandlers = () => {
    bindClicks(Array.from(withId('actions').querySelectorAll('button')));

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
