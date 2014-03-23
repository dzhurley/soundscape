define(function() {
    return function() {
        var nextArtistCallCount = 0;

        var artister = {
            artistIndex: 0,

            setData: function(data) {
                this.artists = data;
                this.totalArtists = data.length;
            },

            nextArtist: function() {
                var artist;

                // rollover to beginning of artists
                if (this.artistIndex === this.totalArtists) {
                    this.artistIndex = 0;
                }
                artist = this.artists[this.artistIndex];
                if (artist.faces === 0) {
                    if (nextArtistCallCount === this.totalArtists) {
                        // when we've recursed to confirm every `artist.faces` is 0,
                        // we are done painting and return
                        return false;
                    }
                    // if there aren't any faces left to paint for this artist, check
                    // the next artist and record how far we've recursed
                    nextArtistCallCount++;
                    this.artistIndex++;
                    return artister.nextArtist(this.artists);
                }
                // log that this artist painted a face
                artist.faces--;
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
