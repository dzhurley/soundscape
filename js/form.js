const { emit, on } = require('dispatch');
const { qs } = require('helpers');

const name = qs('.username');
const field = qs('.user-form');
const input = qs('.user-form-username');
const error = qs('.user-form-error');

const errorOn = () => error.style.display = 'block';
const errorOff = () => error.style.display = 'none';

const setError = (msg='') => {
    error.textContent = msg;
    errorOn();
};

const showField = () => {
    field.style.display = 'flex';
    name.style.display = 'none';
    input.value = '';
    input.focus();
};

const showName = () => {
    field.style.display = 'none';
    name.style.display = 'block';
    errorOff();
};

const create = () => {
    qs('.username').addEventListener('click', showField);
    qs('.user-form').addEventListener('submit', evt => {
        evt.preventDefault();
        emit('submitting', input.value);
        return false;
    });

    qs('#scape').addEventListener('click', () => {
        input.blur();
        if (name.textContent) showName();
    });

    on('submitted', () => {
        qs('.username').textContent = input.value;
        showName();
        qs('.search').style.display = 'flex';
    });

    on('formError', setError);
};


module.exports = { create };
