'use strict';
const path = require('path');

module.exports = (env, options) => {

	return {
		mode: 'production',
		devtool: 'source-map',
		entry: './src/lib/index.ts',
		output: {
			library: 'rcg',
      libraryTarget: 'umd',
			umdNamedDefine: true,
			globalObject: 'this',
      filename: 'rcg.bundle.min.js',
		  path: path.resolve(__dirname, 'dist-js/lib')
		},
	  module: {
				rules: [
					{
						test: /\.ts\.html$/i,
						use: ['html-loader']
					},
				  {
						test: /\.ts\.css$/i,
						use: ['html-loader']
					},
					{
						test: /\.tsx?$/,
						loader: 'ts-loader'
					},
				]
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', 'html', 'css'],
			alias: { '@src' : path.resolve(__dirname, './src/lib/')
			}
		},
		resolveLoader: {
		  modules: ['node_modules', path.resolve(__dirname, './loaders')]
		}
	};
};
