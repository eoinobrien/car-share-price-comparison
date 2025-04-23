const fs = require('fs-extra');
const path = require('path');

// Ensure the dist directory exists
fs.ensureDirSync(path.join(__dirname, 'dist'));

// Copy CSS directory
fs.copySync(
  path.join(__dirname, 'css'),
  path.join(__dirname, 'dist', 'css')
);

// Copy images directory
fs.copySync(
  path.join(__dirname, 'images'),
  path.join(__dirname, 'dist', 'images')
);

console.log('Static files copied to dist directory successfully');