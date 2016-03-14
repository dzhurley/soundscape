'use strict';

module.exports = [
    // on form submission
    'submitting',
    // on POST to data source
    'submitted',

    // ui event
    'toggleControls',

    'lab.*',
    // a lab's trigger was emitted
    'lab.trigger',
    // a lab that requires reset was toggled
    'lab.reset',

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
