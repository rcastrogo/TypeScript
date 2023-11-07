'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, options) => {

  const isDevelopment = options.mode !== 'production'
	
	return {
		watch: isDevelopment ? true : false,
		mode: isDevelopment ? 'development' : 'production',
		devtool: isDevelopment ? 'inline-source-map' : undefined,
		entry: './src/app.ts',
		output: {
		  filename: isDevelopment ? '[name].js' : '[name].[fullhash].js',
		  path: path.resolve(__dirname, 'docs')
		},
		devServer: {
		  port: 8080,
			static: path.resolve(__dirname, 'docs'),
		  historyApiFallback: true
		},
		plugins: [
		  new HtmlWebpackPlugin({
				fullhash: true,
				template: './src/index.html',
				templateParameters: {
					title   : 'TypeScript',
					baseHref : isDevelopment ? '/' : '/TypeScript/',
				}
		  }),
		  new HtmlWebpackPlugin({
				fullhash: true,
				filename: '404.html',
				template: './src/index.html',
				templateParameters: {
					title   : 'TypeScript',
					baseHref : '/TypeScript/',
				}
		  })
		],
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
