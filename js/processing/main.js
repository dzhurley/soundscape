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
            facer: facer,
            artister: artister,
            looper: looper,

            init: function() {
                this.looper.setRefs(this.facer, this.artister);
                App.vent.on('fetched.artists', _.bind(this.process, this));
            },

            process: function(evt, data) {
                this.artister.setData(data);
                this.randos = h.randomBoundedArray(0, this.facer.faces.length - 1);

                var totalPlays = _.reduce(data, function(memo, d) {
                    return memo + d.playCount;
                }, 0);

                _.map(facer.faces, function(face) {
                    face.data = {};
                });

                _.map(data, function(artist) {
                    // faces available for a given artist to paint
                    artist.faces = Math.round(artist.playCount * facer.faces.length / totalPlays);
                    return artist;
                });

                for(var i in this.randos) {
                    this.looper.runLoop(this.randos[i]);
                }

                App.three.mesh.update();
            }
        };

        processor.init();
        return processor;
    };
});
