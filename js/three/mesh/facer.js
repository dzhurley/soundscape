define([
    'underscore',
    'threejs',
    '../scene'
], function(_, THREE, scene) {
    return function(geometry) {
        var Facer = {
            geo: geometry
        };

        return Facer;
    };
});
