'use strict';

module.exports = {
    entry: './js/app.js',
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    output: {
        path: __dirname + '/build',
        filename: 'app.js',
        publicPath: '/build'
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js'],
        root: ['js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel?experimental']
            }
        ]
    }
};
