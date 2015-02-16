define([
    'underscore',
    'helpers',
    'threejs'
], function(_, h, THREE) {
    // { color, faces, name, outerBoundaryEdges, plays }

    return function() {
        var nextArtistCallCount = 0;

        var artistManager = {
            artistIndex: 0,

            edgesForArtist: function(artistName) {
                var artist = _.findWhere(this.artists, { name: artistName });
                return artist && artist.edges;
            },

            processArtists: function(artists) {
                var totalPlays = _.reduce(artists, function(memo, artist) {
                    return memo + artist.playCount;
                }, 0);

                _.map(artists, function(artist, i) {
                    artist.edges = [];

                    // faces available for a given artist to paint
                    artist.faces = Math.floor(artist.playCount * this.totalFaces / totalPlays);

                    // color generated from rank
                    artist.color = new THREE.Color(h.spacedColor(artists.length, i));
                    artist.color.multiplyScalar(artist.normCount);

                    return artist;
                }.bind(this));

                // don't bother with artists that don't merit faces
                return _.filter(artists, function(artist) {
                    return artist.faces > 0;
                });
            },

            setData: function(artists, totalFaces) {
                this.totalFaces = totalFaces;
                this.artists = _.shuffle(this.processArtists(artists));
                this.artistIndex = 0;
            },

            // TODO: rework in entirety, and most likely move
            expandArtistEdges: function(face, artist, edge) {
                var second;
                var third;

                // find the other sides of the face that we'll overtake
                artist.edges.splice(artist.edges.indexOf(edge), 1);
                if (App.heds.isSameEdge(edge, {v1: face.a, v2: face.b})) {
                    second = {v1: face.a, v2: face.c};
                    third = {v1: face.b, v2: face.c};
                } else if (App.heds.isSameEdge(edge, {v1: face.a, v2: face.c})) {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.b, v2: face.c};
                } else {
                    second = {v1: face.a, v2: face.b};
                    third = {v1: face.a, v2: face.c};
                }
                artist.edges.push(second, third);

                // TODO: handle swapping
            },

            nextArtist: function() {
                var artist;

                // rollover to beginning of artists
                if (this.artistIndex === this.artists.length) {
                    this.artistIndex = 0;
                }
                artist = this.artists[this.artistIndex];
                if (artist.faces === 0) {
                    if (nextArtistCallCount === this.artists.length) {
                        // when we've recursed to confirm every `artist.faces` is 0,
                        // we are done painting and return
                        return false;
                    }
                    // if there aren't any faces left to paint for this artist,
                    // look towards the next artist and record how far we've recursed
                    nextArtistCallCount++;
                    this.artistIndex++;
                    return artistManager.nextArtist();
                }
                // set up next call for next artist
                this.artistIndex++;
                // reset recursive logging
                nextArtistCallCount = 0;
                return artist;
            }
        };

        return artistManager;
    };
});
