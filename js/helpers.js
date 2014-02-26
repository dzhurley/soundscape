define([
    'underscore'
], function(_) {
    var spacedColor = function(numOfSteps, step) {
        // http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }
        return "0x" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    };

    var normalize = function(data, key, saveAs) {
        var counts = _.pluck(data, key);

        var max = Math.max.apply(this, counts),
            min = Math.min.apply(this, counts),
            denom = max - min;

        if (saveAs) {
            _.each(data, function(datum) {
                datum[saveAs] = (datum[key] - min) / denom;
            });
        }
        return data;
    };

    return {
        normalize: normalize,
        spacedColor: spacedColor
    };
});
