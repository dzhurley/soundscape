'use strict';

/* Interface for the DOM around UI event bindings
 *
 * Button selectors are cached and events are pumped into Dispatch
 */

let Dispatch = require('./dispatch');
let Threes = require('./three/main');

class DOM {
    attachTo(element) {
        this.findElements();
        this.container.appendChild(element);
        this.bindHandlers();
    }

    findElements() {
        this.container = document.getElementById('scape');
        this.hudContainer = document.getElementById('hud');
        this.sourcesOverlay = document.getElementById('sources-overlay');
        this.sourcesButton = document.getElementById('toggleOverlay');
        this.controlsButton = document.getElementById('toggleControls');
        this.sourcesPrompt = document.getElementById('sources');
    }

    bindHandlers() {
        let mainButtons = Array.from(document.querySelectorAll('.main button'));
        let workerButtons = Array.from(document.querySelectorAll('.worker button'));

        mainButtons.forEach(button => button.addEventListener('click', () => this[button.id]()));
        workerButtons.forEach(button => this.workerBindings(button));

        this.sourcesPrompt.addEventListener('submit', evt => Dispatch.emit('submitting', evt));

        Dispatch.on('submitted', () => {
            document.querySelector('#username').value = '';
            this.sourcesButton.click();
        });
    }

    workerBindings(button) {
        button.addEventListener(
            'click', () => Dispatch.emitOnWorker.call(Dispatch, `plot.${button.id}`));
    }

    toggleControls() {
        if (Threes.controls) Threes.controls.toggleControls();
    }

    toggleOverlay() {
        let classes = this.sourcesOverlay.classList;
        classes.toggle('closed');
        if (!classes.contains('closed')) {
            this.sourcesPrompt.querySelector('#username').focus();
        }
    }
}

module.exports = new DOM();
