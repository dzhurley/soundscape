define([
    'underscore',
    'helpers',
    'threejs',
    './artists',
    './faces',
    './looper'
], function(_, h, THREE, ArtistProcessor, FaceProcessor, Looper) {
    return function() {
        var facer = new FaceProcessor();
        var artister = new ArtistProcessor();
        var looper = new Looper();

        var processor = {
            init: function() {
                this.facer = facer,
                this.artister = artister,
                this.looper = looper;
                this.looper.init(this.facer, this.artister);
                App.vent.on('fetched.artists', _.bind(this.process, this));
            },

            process: function(evt, data) {
                var totalPlays = _.reduce(data, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(this.facer.faces, function(face) {
                    face.data = {};
                });

                _.map(data, _.bind(function(d) {
                    // faces available for a given artist to paint
                    d.faces = Math.round(d.playCount * this.facer.faces.length / totalPlays);
                    d.edges = [];
                    return d;
                }, this));
                // don't bother with artists that don't merit faces
                data = _.filter(data, function(d) { return d.faces > 0; });
                this.artister.setData(data);

                this.looper.loop(h.randomBoundedArray(0, this.facer.faces.length - 1));
                App.three.mesh.update();
            }
        };

        processor.init();
        return processor;
    };
});
