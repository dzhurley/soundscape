// All TWEEN specific details excluding callbacks are contained here for
// central number tweaking/experimenting. Callbacks such as onUpdate(), and
// directives like start(), are left to the calling code.
const TWEEN = require('tween.js');

const { globe: { radius } } = require('constants');

const autocomplete = {
    focus(from, to) {
        return new TWEEN.Tween(from).to(to, 1000).easing(TWEEN.Easing.Quadratic.InOut);
    }
};

const seeds = {
    move(from, to) {
        return new TWEEN.Tween(from).to(to, 1000).easing(TWEEN.Easing.Elastic.Out);
    },
    show(from) {
        from.multiplyScalar(radius - 40);
        const to = from.clone().multiplyScalar(1.25);
        return new TWEEN.Tween(from)
            .to(to, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .delay(Math.random() * 1000);
    },
    sink(from) {
        return new TWEEN.Tween(from)
            .to({ x: from.x / 1.1, y: from.y / 1.1, z: from.z / 1.1 }, 1000);
    }
};

module.exports = { autocomplete, seeds };
