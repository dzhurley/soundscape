define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function(geometry) {
        var Facer = {
            geo: geometry,

            setGeometry: function(geo) {
                this.geo = geo;
            }
        };

        return Facer;
    };
});
