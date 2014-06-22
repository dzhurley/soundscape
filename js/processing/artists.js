define(['underscore'], function(_) {
    return function() {
        var nextArtistCallCount = 0;

        var artister = {
            artistIndex: 0,

            setData: function(data) {
                this.artists = _.shuffle(data);
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
                    return artister.nextArtist();
                }
                // set up next call for next artist
                this.artistIndex++;
                // reset recursive logging
                nextArtistCallCount = 0;
                return artist;
            }
        };

        return artister;
    };
});
