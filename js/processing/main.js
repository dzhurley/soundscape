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

            preprocess: function(data) {
                var totalPlays = _.reduce(this.activeData, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(this.facer.faces, function(face) {
                    face.data = {};
                });

                _.map(this.activeData, _.bind(function(d, i) {
                    d.edges = [];
                    // faces available for a given artist to paint, pulling back a little from
                    // the exact face count to leave some room and avoid lots of collisions with
                    // other artists and their random growth
                    d.faces = Math.round(d.playCount * this.facer.faces.length / totalPlays);
                    d.rank = i;
                    return d;
                }, this));

                // don't bother with artists that don't merit faces
                this.activeData = _.filter(this.activeData, function(d) { return d.faces > 0; });
            },

            process: function(evt, data) {
                var loopSequence = [];
                var stagger;
                var initialOffset;

                this.activeData = data;
                this.preprocess();
                this.artister.setData(this.activeData);

                // stagger out the seed faces for each artists, avoiding getting
                // too close to the poles for now
                stagger = Math.floor(this.facer.faces.length / this.artister.artists.length);
                initialOffset = Math.floor(Math.floor(this.facer.faces.length / stagger) / 2);

                for (var i = initialOffset; i < this.facer.faces.length; i += stagger) {
                    if (loopSequence.length == this.artister.artists.length) {
                        break;
                    }
                    loopSequence.push(i);
                }

                // // seed the planet
                this.looper.loop(loopSequence.slice(0));
                // grow the seeds
                var randos = h.randomBoundedArray(0, this.facer.faces.length - 1);
                App.remaining = _.difference(randos, loopSequence);

                _.times(App.remaining.length, function(n) {App.$paintFace.click();});
            },
        };

        processor.init();
        return processor;
    };
});
