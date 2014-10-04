define([
    'underscore',
    'helpers',
    'threejs',
    'processing/artists',
    'processing/faces',
    'processing/looper'
], function(_, h, THREE, ArtistProcessor, FaceProcessor, Looper) {
    return function() {
        var processor = {
            init: function() {
                this.artister = new ArtistProcessor();
                this.facer = new FaceProcessor(this.artister);
                this.looper = new Looper(this.facer, this.artister);

                // how many faces to paint before allowing a rerender
                this.batchSize = 1;

                App.vent.on('fetched.artists', _.bind(this.seed, this));
            },

            preProcessData: function(data) {
                // TODO: clear sphere for next user
                var totalPlays = _.reduce(data, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(this.facer.faces, function(face) {
                    face.data = {};
                });

                _.map(data, _.bind(function(d, i) {
                    d.edges = [];
                    // faces available for a given artist to paint
                    d.faces = Math.round((d.playCount * this.facer.faces.length / totalPlays) * 0.5);
                    // since incoming data is sorted, rank artists as we preProcess
                    d.rank = i;
                    return d;
                }, this));

                // don't bother with artists that don't merit faces
                return _.filter(data, function(d) {
                    return d.faces > 0;
                });
            },

            seed: function(evt, data) {
                var preppedData = this.preProcessData(data);
                this.artister.setData(preppedData);
                this.batchSize = this.artister.artists.length;

                // seed the planet
                var seeds = this.facer.findEquidistantFaces(this.artister.artists.length);
                var seedIndices = _.pluck(seeds, 'faceIndex');
                this.looper.loop(seedIndices);

                // set remaining faces to paint
                var randos = h.randomBoundedArray(0, this.facer.faces.length - 1);
                App.remaining = _.difference(randos, seedIndices);
                App.vent.trigger('seeded');
            },

            processBatch: function() {
                for (var i = 0; i <= this.batchSize; i++) {
                    if (this.looper.loopOnce()) {
                        break;
                    }
                }
            }
        };

        processor.init();
        return processor;
    };
});
