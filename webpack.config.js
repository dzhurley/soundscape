const path = require('path');
const webpack = require('webpack');

const config = {
    entry: './js/app.js',

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: 'build'
    },

    resolve: {
        extensions: ['', '.js'],
        root: path.resolve(__dirname, 'js')
    },

    module: {
        loaders: [
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
