define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function(geometry) {
        var Facer = {
            geo: geometry
        };

        return Facer;
    };
});
