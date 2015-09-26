'use strict';

module.exports = {
    entry: './js/app.js',
    debug: true,
    devtool: 'source-map',
    output: {
        path: __dirname,
        filename: 'build.js',
        publicPath: '/'
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js'],
        root: ['js']
    },
    resolveLoader: {
        modulesDirectories: ['node_modules']
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
