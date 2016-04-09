var $path = require('path');

module.exports = {
	context: __dirname,
	entry: {
		'ajax-servant': [__dirname + '/src/ajax-servant.js'],
		'test': 'mocha!./test/index.js'
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].bundle.js',
		libraryTarget: 'umd',
		library: 'AjaxServant',
		pathinfo: true
	}
	,
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			include: [
				$path.resolve(__dirname, "./src")
			],
			loader: 'babel-loader'
		}]
	}
};