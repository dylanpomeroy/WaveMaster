const path = require('path')

module.exports = {
    mode: 'development',
    watch: true,
    entry: './client',
    output: {
        path: path.resolve(`${__dirname}/dist/scripts`)
    }
}