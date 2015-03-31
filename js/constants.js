// used on both app and worker side to create some sense of coherence

const globe = Object.freeze({
    radius: 50,
    widthAndHeight: 50
});

const labels = Object.freeze({
    'backgroundColor': '#272727',
    'color': '#d7d7d7',
    'fontface': 'Inconsolata',
    'fontsize': '300'
});

const stars = Object.freeze({
    number: 1000,

    initialX: function() {
        return Math.random() * 2 - 1;
    },
    initialY: function() {
        return Math.random() * 2 - 1;
    },
    initialZ: function() {
        return Math.random() * 2 - 1;
    },

    positionMultiplier: function() {
        return Math.random() * 100 + 200;
    },
    scaleMultiplier: function() {
        return Math.random() * 0.5;
    }
})

module.exports = Object.freeze({ globe, labels, stars });
