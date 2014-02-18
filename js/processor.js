define([
    'underscore',
    'three'
], function(_, THREE) {
    var updateFaces = function(artists) {
        var faces = App.mesh.globe.geometry.faces;
        for(var i in faces) {
            // earth: #3C9251, ocean: #6370FD
            faces[i].color.setHex(_.sample([0x3C9251, 0x6370FD]));
            faces[i].data = {
                name: i,
                color: '#' + faces[i].color.getHexString()
            };
        }
    };

    return {
        process: function(artists) {
            updateFaces(this.artists);
            App.mesh.update();
        }
    };
});
