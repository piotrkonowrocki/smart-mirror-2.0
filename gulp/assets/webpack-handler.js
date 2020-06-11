'use strict';

const path = require('path');
const webpack = require('webpack');

const config = require('./config.json');
const Paths = require('./paths');

const paths = new Paths();

module.exports = class WebpackHandler {
    constructor() {
        if (WebpackHandler.singletonInstance) return WebpackHandler.singletonInstance;
        WebpackHandler.singletonInstance = this;
    }

    handleJs(mode) {
        return new Promise(resolve => {
            webpack({
                mode: mode === 'production' ? 'production' : 'development',
                entry: [
                    'core-js/modules/es6.array.iterator',
                    paths.getPath('scriptsSource') + config.files.scriptsSource
                ],
                output: {
                    filename: config.files.scriptsResults,
                    chunkFilename: '[name].[chunkhash].chunk.js',
                    path: path.normalize(paths.getPath('scriptsTemp')),
                    publicPath: `${path.relative(paths.getPath('templatesTemp'), paths.getPath('scriptsTemp'))}/`
                },
                devtool: mode !== 'fast' ? 'source-map' : 'none',
                cache: !(mode === 'production'),
                optimization: {
                    minimize: mode === 'production',
                    noEmitOnErrors: false
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/u,
                            exclude: /(node_modules)/u,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: [['@babel/preset-env', {
                                        targets: {
                                            browsers: ['last 2 versions', 'ie >= 11']
                                        },
                                        useBuiltIns: 'usage',
                                        corejs: 'core-js@2'
                                    }]],
                                    cacheDirectory: true
                                }
                            }
                        }
                    ]
                }
            }).run(resolve);
        });
    }
};
