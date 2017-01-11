const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    entry: './js/app.js',

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'build')
    },

    resolve: {
        extensions: ['', '.js', '.scss'],
        root: ['js', 'css'].map(p => path.resolve(__dirname, p))
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
    ],

    postcss(wp) {
        return [
            require('postcss-import')({ addDependencyTo: wp }),
            require('autoprefixer'),
            require('postcss-mixins'),
            require('postcss-nested'),
            require('postcss-simple-vars')
        ];
    }
};

if (process.env.NODE_ENV === 'production') {
    // handle separate css bundling
    config.module.loaders.push({
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
    });
    config.plugins.push(new ExtractTextPlugin('style.css'));
} else {
    config.devtool = 'cheap-module-source-map';

    // handle inline css bundling
    config.module.loaders.push({
        test: /\.scss$/,
        loader: 'style-loader!css-loader!postcss-loader'
    });
}

module.exports = config;
