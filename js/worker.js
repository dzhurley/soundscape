importScripts('../bower_components/requirejs/require.js', 'config.js');

require({
    baseUrl: './'
}, [
    'underscore'
], function(_) {
    onmessage = function(evt) {
        postMessage('from the worker: ' + evt.data);
    };
});
