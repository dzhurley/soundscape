define([
    'underscore',
    'helpers',
    'three/mesh/edger',
    'three/mesh/facer',
    'plotting/artists',
    'plotting/faces',
    'plotting/looper'
], function(_, h, Edger, Facer, ArtistPlotter, FacePlotter, Looper) {

    return function(mesh) {
        var seeder = {
            init: function() {
                this.edger = new Edger(mesh.geometry);
                this.facer = new Facer(mesh);
                this.artister = new ArtistPlotter(this.edger);
                // TODO: don't depend on passing so much
                this.facePlotter = new FacePlotter(this.artister, mesh, this.edger);
                this.looper = new Looper(this.facePlotter, this.artister, this);

                // how many faces to paint before allowing a rerender
                this.batchSize = 1;
            },

            preProcessData: function(data) {
                var totalPlays = _.reduce(data, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(this.facePlotter.faces, function(face) {
                    face.data = {};
                });

                _.map(data, _.bind(function(d, i) {
                    d.edges = [];
                    // faces available for a given artist to paint
                    d.faces = Math.round((d.playCount * this.facePlotter.faces.length / totalPlays) * 0.5);
                    // since incoming data is sorted, rank artists as we preProcess
                    d.rank = i;
                    return d;
                }, this));

                // don't bother with artists that don't merit faces
                return _.filter(data, function(d) {
                    return d.faces > 0;
                });
            },

            seed: function(data) {
                var preppedData = this.preProcessData(data);
                if (!preppedData.length) {
                    // TODO: find a nicer way
                    alert('user has no plays');
                    return;
                }
                this.artister.setData(preppedData);
                this.batchSize = this.artister.artists.length;

                // seed the planet
                var seeds = this.facer.findEquidistantFaces(this.artister.artists.length);
                var seedIndices = _.pluck(seeds, 'faceIndex');
                this.looper.loop(seedIndices);

                // set remaining faces to paint
                var randos = h.randomBoundedArray(0, this.facePlotter.faces.length - 1);
                return _.difference(randos, seedIndices);
            }
        };

        seeder.init();
        return seeder;
    };
});
