const path = require('path');
const fs = require('fs-extra');

// Copy index.html to dist on webpack execution
fs.copySync(
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'dist', 'index.html')
);

module.exports = {
  mode: 'development', // Change to 'production' for minified output
  entry: './js/app.ts', // Your main entry point
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  devtool: 'source-map', // Helps with debugging
};