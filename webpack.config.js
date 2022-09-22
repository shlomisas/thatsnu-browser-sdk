const { ProvidePlugin } = require('webpack');
const path = require('path');

module.exports = (env, argv) => {

    const isDev = argv.mode === 'development'

    return {
        context: path.resolve(__dirname, 'src'),
        entry: './index.ts',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            clean: !isDev,
            library: {
                type: 'umd'
            },
            globalObject: 'this'

        },
        devtool: isDev ? 'source-map' : undefined,
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
};