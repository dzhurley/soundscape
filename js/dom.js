let _ = require('underscore');
let Dispatch = require('./dispatch');
let Threes = require('./three/main');

let DOM = {
    container: document.getElementById('scape'),
    hudContainer: document.getElementById('hud'),
    sourcesOverlay: document.getElementById('sources-overlay'),
    sourcesButton: document.getElementById('toggleOverlay'),
    controlsButton: document.getElementById('toggleControls'),
    sourcesPrompt: document.getElementById('sources'),

    workerBindings(button) {
        button.addEventListener(
            'click', () => Dispatch.emitOnWorker.call(Dispatch, `plot.${button.id}`));
    },

    toggleControls() {
        Threes.controls.toggleControls();
    },

    toggleOverlay() {
        let classes = this.sourcesOverlay.classList;
        classes.toggle('closed');
        if (!classes.contains('closed')) {
            this.sourcesPrompt.querySelector('#username').focus();
        }
    },

    bind() {
        let mainButtons = document.querySelectorAll('.main button');
        let workerButtons = document.querySelectorAll('.worker button');

        _.each(mainButtons, (button) =>
               button.addEventListener('click', () => this[button.id]()));
        _.each(workerButtons, (button) => this.workerBindings(button));

        this.sourcesPrompt.addEventListener('submit', (evt) => Dispatch.emit('submitting', evt));

        Dispatch.on('submitted', (evt) => {
            document.querySelector('#username').value = '';
            this.sourcesButton.click();
        });
    }
}

module.exports = DOM;
