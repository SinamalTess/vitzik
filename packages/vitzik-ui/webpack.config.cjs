const path = require('path')

module.exports = {
    entry: ['./src/index.ts'],
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'babel-loader',
                },
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        library: 'vitzikUi',
        libraryTarget: 'umd',
        filename: 'index.js',
        path: path.resolve(__dirname, 'lib'),
    },
    externals: {
        react: 'react',
        'react-dom': 'react-dom',
    },
}
