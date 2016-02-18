'use strict';

/* Interface for the DOM around UI event bindings */

const { emit, emitOnWorker, on } = require('./dispatch');
const HUD = require('./hud');
const { currentLabs, isActive } = require('./labs');

const withId = selector => document.getElementById(selector);
const container = withId('scape');

const handlers = {
    toggleControls(evt) {
        emit('toggleControls', evt.target.textContent);
    },
    toggleOverlay() {
        let classes = withId('sourcesOverlay').classList;
        classes.toggle('closed');
        if (!classes.contains('closed')) withId('username').focus();
    }
};

const bindMainButtons = () => {
    let buttons = Array.from(document.querySelectorAll('.main button'));
    buttons.map(button => button.addEventListener('click', handlers[button.id]));
};

const bindIterateButtons = () => {
    let buttons = Array.from(document.querySelectorAll('.worker button'));
    let clickOnWorker = evt => emitOnWorker.call(emitOnWorker, `plot.${evt.target.id}`);
    buttons.map(button => button.addEventListener('click', clickOnWorker));
};

const bindLabs = () => {
    let labs = currentLabs();
    withId('labs').innerHTML = Object.keys(labs).reduce((m, type) => {
        let keyed = Object.keys(labs[type]).reduce((m, key) => {
            return m + `<button id="${key}" class="${isActive(key, type)}">${key}</button>`;
        }, '');
        return m + `<section id="${type}">${keyed}</section>`;
    }, '');
};

const bindHandlers = () => {
    bindMainButtons();
    bindIterateButtons();

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
