const { ProvidePlugin } = require('webpack');
const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        //clean: true,
        library: {
            type: 'umd'
        },
        globalObject: 'this'

    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.less$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "less-loader",
                ]
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new ProvidePlugin({
            $: "node_modules/cash-dom"
        })
    ]
};