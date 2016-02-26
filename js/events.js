'use strict';

module.exports = [
    // on form submission
    'submitting',
    // on POST to data source
    'submitted',

    // ui event
    'toggleControls',

    // first call from worker to sync artists
    'getArtists',
    // subsequent calls from worker to sync artists
    'updateArtists',

    // a lab's trigger was emitted
    'triggered',
    // a lab that requires reset was toggled
    'labReset',

    // passed from ui into worker to kick off plotting strategies
    'plot.*',
    'plot.seed',
    'plot.one',
    'plot.batch',
    'plot.all',

    // returned from worker to main thread for scene updates
    'faces.*',
    'faces.seeded',
    'faces.painted'
];
