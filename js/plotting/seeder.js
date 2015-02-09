define([
    'underscore',
    'helpers',
    'plotting/faces',
    'plotting/looper'
], function(_, h, FacePlotter, Looper) {

    return function(mesh) {
        var seeder = {
            init: function() {
                this.meshUtils = mesh.utils;
                this.facePlotter = new FacePlotter(mesh);
                this.looper = new Looper(this.facePlotter, this);

                // how many faces to paint before allowing a rerender
                this.batchSize = 1;
            },

            seed: function(data) {
                if (!data.length) {
                    // TODO: find a nicer way
                    alert('user has no plays');
                    return;
                }
                App.artistManager.setData(data, this.facePlotter.faces.length);

                _.map(this.facePlotter.faces, function(face) {
                    face.data = {};
                });

                this.batchSize = App.artistManager.artists.length;

                // seed the planet
                var seeds = this.meshUtils.findEquidistantFaces(App.artistManager.artists.length);
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
