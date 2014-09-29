define([
    'underscore',
    'helpers',
    'threejs'
], function(_, h, THREE) {
    return function(geometry) {
        var Facer = {
            geo: geometry,

            resetFaces: function() {
                // zero face values for fresh paint
                _.map(this.geo.faces, function(f) {
                    f.data = {};
                    f.color.setHex(0xFFFFFF);
                });
                this.geo.colorsNeedUpdate = true;
            }
        };

        return Facer;
    };
});
