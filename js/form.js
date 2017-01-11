const { emit, on } = require('dispatch');
const { qs } = require('helpers');

const field = qs('.user-form');
const input = qs('.user-form-username');
const name = qs('.username');

// TODO: reinstate
// const error = qs('.user-form-error');
// const setError = (msg='') => error.textContent = msg;
// const errorOn = () => error.style.display = 'block';
// const errorOff = () => error.style.display = 'none';

const showField = () => {
    field.style.display = 'flex';
    name.style.display = 'none';
    input.focus();
};

const showName = () => {
    field.style.display = 'none';
    name.style.display = 'inline-block';
};

const create = () => {
    qs('.username').addEventListener('click', showField);
    qs('.user-form').addEventListener('submit', evt => {
        evt.preventDefault();
        emit('submitting', input.value);
        return false;
    });

    qs('#scape').addEventListener('click', () => input.blur());

    on('submitted', () => {
        qs('.username').textContent = input.value;
        showName();
        qs('.search').style.display = 'block';
    });

    on('formError', (message, ...args) => console.error(`thrown: ${message}`, args));
};


module.exports = { create };
