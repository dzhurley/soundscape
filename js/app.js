define([
    'jquery',
    'eventbus',
    'fly',
    'three/main',
    'processing/main',
    'last',
    'headsUp'
], function($, EventBus, THREE, Threes, Processor, Last, HeadsUp) {
    return function() {
        var app = {
            $container: $('#scape'),
            $headsUp: $('#heads-up'),
            $paintFace: $('#paint-face'),
            $showArtist: $('#show-artist'),

            init: function() {
                this.vent = new EventBus();
                this.three = new Threes();
                this.processor = new Processor();
                this.headsUp = new HeadsUp();

                this.$container.append(this.three.renderer.domElement);
                this.bindHandlers();
                this.animate();

                this.last = new Last();
            },

            animate: function() {
                window.requestAnimationFrame(app.animate);
                app.three.animate();
            },

            bindHandlers: function() {
                this.$paintFace.click(_.bind(this.processOne, this));
                this.$showArtist.click(_.bind(this.showArtist, this));
            },

            processOne: function() {
                if (this.stopPainting) {
                    return false;
                }
                this.processor.looper.loopOnce(this.remaining);
                this.three.mesh.update();
            },

            showArtist: function() {
                // pulse an artist's territory orange for .5 seconds
                var artist = this.$headsUp.find(':contains(artist)');
                if (artist.length) {
                    artist = artist.text().split(':')[1].trim();
                    var faces = _.filter(this.processor.facer.faces, function(choice) {
                        return choice.data.artist === artist;
                    });

                    if (faces.length) {
                        var savedColor = _.clone(faces[0].color);

                        _.map(faces, function(face) {
                            face.color = new THREE.Color(0xffa500);
                        });
                        this.three.mesh.update();

                        setTimeout(function(faces, savedColor) {
                            _.map(faces, function(face) {
                                face.color = savedColor;
                            });
                            App.three.mesh.update();
                        }, 500, faces, savedColor);
                    }
                }
            }
        };

        return app;
    };
});
