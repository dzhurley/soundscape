importScripts(/* hmm */);

onmessage = function(evt) {
    postMessage('from the worker: ' + evt.data);
};
