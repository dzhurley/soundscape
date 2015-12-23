'use strict';

/* Interface for the DOM around UI event bindings */

const Dispatch = require('./dispatch');
const Threes = require('./three/main');

const withId = selector => document.getElementById(selector);
const Container = withId('scape');
const HudContainer = withId('hud');

const handlers = {
    toggleControls() {
        if (Threes.controls) Threes.controls.toggleControls();
    },

    toggleOverlay() {
        let classes = withId('sources-overlay').classList;
        classes.toggle('closed');
        if (!classes.contains('closed')) withId('username').focus();
    }
};

function bindMainButtons() {
    let buttons = Array.from(document.querySelectorAll('.main button'));
    buttons.map(button => button.addEventListener('click', handlers[button.id]));
}

function bindWorkerButtons() {
    let buttons = Array.from(document.querySelectorAll('.worker button'));
    let clickOnWorker = evt => Dispatch.emitOnWorker.call(Dispatch, `plot.${evt.target.id}`);
    buttons.map(button => button.addEventListener('click', clickOnWorker));
}

function bindHandlers() {
    bindMainButtons();
    bindWorkerButtons();

    withId('sources').addEventListener('submit', evt => Dispatch.emit('submitting', evt));

    Dispatch.on('submitted', () => {
        withId('username').value = '';
        withId('toggleOverlay').click();
    });
}

module.exports = {
    Container,
    HudContainer,
    attachWebGLement: el => {
        Container.appendChild(el);
        bindHandlers();
    }
};
