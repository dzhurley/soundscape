define([
    'underscore',
    './faces'
], function(_, FaceProcessor) {
    return function() {
        var facer = new FaceProcessor();

        var processor = {
            facer: facer,

            process: function(evt, data) {
                this.facer.process(data);
            }
        };

        App.vent.on('fetched.artists', _.bind(processor.process, processor));

        return processor;
    };
});
