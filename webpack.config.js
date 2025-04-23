const path = require('path');
const fs = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'index.html' },
        { from: 'css', to: 'css' },
        { from: 'images', to: 'images' },
      ],
    }),
  ],
  devtool: 'source-map', // Helps with debugging
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000,
  },
};