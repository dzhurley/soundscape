'use strict';

/* Interface for the DOM around UI event bindings */

const { emit, emitOnWorker, on } = require('./dispatch');
const HUD = require('./hud');

const withId = selector => document.getElementById(selector);
const container = withId('scape');

const handlers = {
    toggleControls(evt) {
        emit('toggleControls', evt.target.textContent);
    },
    toggleOverlay() {
        let classes = withId('sources-overlay').classList;
        classes.toggle('closed');
        if (!classes.contains('closed')) withId('username').focus();
    }
};

const bindMainButtons = () => {
    let buttons = Array.from(document.querySelectorAll('.main button'));
    buttons.map(button => button.addEventListener('click', handlers[button.id]));
};

const bindWorkerButtons = () => {
    let buttons = Array.from(document.querySelectorAll('.worker button'));
    let clickOnWorker = evt => emitOnWorker.call(emitOnWorker, `plot.${evt.target.id}`);
    buttons.map(button => button.addEventListener('click', clickOnWorker));
};

const bindHandlers = () => {
    bindMainButtons();
    bindWorkerButtons();

    withId('sources').addEventListener('submit', evt => emit('submitting', evt));

    on('submitted', () => {
        withId('username').value = '';
        withId('toggleOverlay').click();
    });
};

const attachWebGLement = el => {
    container.appendChild(el);
    bindHandlers();
    HUD.bindHandlers(container);
};

module.exports = { attachWebGLement, container };
