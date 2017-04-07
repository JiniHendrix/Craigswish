module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'webpack-bundle.js',
        publicPath: '/dist/'
    },
    module: {
		loaders: [
			{
				test: /\.js$|\.jsx$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
						presets: ['es2015', 'react']
				}
			},
			{
				test: /(\.css|\.scss)$/,
				loaders: ['style', 'css', 'sass']
			}
		]
	}
}