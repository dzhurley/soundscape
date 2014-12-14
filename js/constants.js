// used on both app and worker side to create some sense of coherence
define({
    globe: {
        radius: 50,
        widthAndHeight: 50
    },

    labels: {
        'backgroundColor': '#272727',
        'color': '#d7d7d7',
        'fontface': 'Inconsolata',
        'fontsize': '400'
    },

    stars: {
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
    }
});
