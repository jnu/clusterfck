module.exports = {
    entry: {
        'clusterfck': './clusterfck'
    },
    context: './lib',
    output: {
        path: './dist',
        filename: '[name].js',
        library: 'clusterfck',
        libraryTarget: 'umd'
    }
};
