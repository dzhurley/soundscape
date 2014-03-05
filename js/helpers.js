define([
    'underscore'
], function(_) {
    var normalize = function(data, key, saveAs) {
        // normalizes values in `data` at `data[key]` and optionally saves
        // them on each item as `data[saveAs]`, returning `data` when saving
        // and Array of normalized values when not

        var counts = _.pluck(data, key);
        var max = Math.max.apply(this, counts);
        var min = Math.min.apply(this, counts);
        var denom = max - min;

        if (saveAs) {
            _.each(data, function(datum) {
                datum[saveAs] = (datum[key] - min) / denom;
            });
            return data;
        } else {
            return _.map(data, function(datum) {
                return (datum[key] - min) / denom;
            });
        }
    };

    var randomBoundedArray = function(min, max) {
        // enumerates numbers between `min` and `max` inclusive and returns
        // the array in shuffled order

        min = min || 0;
        max = max || 0;

        var bounded = [];
        for (var i = min; i <= max; ++i) {
            bounded.push(i);
        }

        return _.shuffle(bounded);
    };

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

        var first = ("00" + (~ ~(r * 255)).toString(16)).slice(-2);
        var second = ("00" + (~ ~(g * 255)).toString(16)).slice(-2);
        var third = ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
        return "0x" + first + second + third;
    };

    return {
        normalize: normalize,
        randomBoundedArray: randomBoundedArray,
        spacedColor: spacedColor
    };
});
