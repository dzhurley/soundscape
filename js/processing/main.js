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
                var loopSequence = [];
                var stagger;
                var initialOffset;

                var preppedData = this.preProcessData(data);
                this.artister.setData(preppedData);
                this.batchSize = this.artister.artists.length;

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

                // seed the planet
                this.looper.loop(loopSequence.slice(0));

                // set remaining faces to paint
                var randos = h.randomBoundedArray(0, this.facer.faces.length - 1);
                App.remaining = _.difference(randos, loopSequence);
                // App.vent.trigger('seeded');
            },

            findEquidistantishPoints: function() {
                // approach:
                //      - sort artists so popular -> equator and unpopular -> poles
                //      - find points in terms of x, y, z from center
                //          - vogel's method
                //
                //          http://blog.marmakoide.org/?p=1
                //          n = num_artists
                //          golden_angle = numpy.pi * (3 - numpy.sqrt(5))
                //          theta = golden_angle * numpy.arange(n)
                //
                //          z = numpy.linspace(1 - 1.0 / n, 1.0 / n - 1, n)
                //          radius = numpy.sqrt(1 - z * z)
                //          points = numpy.zeros((n, 3))
                //          points[:,0] = radius * numpy.cos(theta)
                //          points[:,1] = radius * numpy.sin(theta)
                //          points[:,2] = z
                //
                //      - find intersections similar to headsUp
                //      - color intersected faces with artists

                var numPoints = this.batchSize;
                var goldenAngle = Math.PI * (3 - Math.sqrt(5));
                var theta = goldenAngle * h.boundedArray(0, numPoints - 1);
                var z = (1 - 1.0 / numPoints, 1.0 / numPoints - 1, numPoints);
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
