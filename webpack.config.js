const path = require('path');
const webpack = require('webpack');

const config = {
    entry: './js/app.js',

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'build')
    },

    resolve: {
        extensions: ['', '.js'],
        root: path.resolve(__dirname, 'js')
    },

    module: {
        loaders: [
            {
                test: /lib\//,
                loaders: ['imports?THREE=three']
            },
            {
                test: /three\/examples/,
                loaders: ['imports?THREE=three']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader', 'eslint']
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': { 'NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
        })
    ]
};

if (process.env.NODE_ENV !== 'production') {
    config.devtool = 'cheap-module-source-map';
}

module.exports = config;
