const { emit, on } = require('dispatch');
const { qs } = require('helpers');

const input = qs('.user-form-username');
const error = qs('.user-form-error');

let used = false;
let lastUser = '';

const create = () => {
    qs('.user-form').addEventListener('submit', evt => {
        evt.preventDefault();
        emit('submitting', input.value);
        return false;
    });

    qs('#scape').addEventListener('click', () => input.blur());

    input.addEventListener('focus', () => {
        if (used) input.value = '';
        error.textContent = '';
        error.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        if (used) input.value = lastUser;
        error.style.display = 'none';
    });

    on('submitted', () => {
        used = true;
        error.textContent = '';
        lastUser = input.value;
        input.blur();
        qs('.search').style.display = 'block';
    });

    on('formError', (message, ...args) => {
        console.error(`thrown: ${message}`, args);
        error.textContent = message;
    });
};


module.exports = { create };
