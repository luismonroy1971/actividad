const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Log the current directory and files to help with debugging
console.log('Current directory:', process.cwd());
console.log('Files in current directory:', fs.readdirSync('.'));

// Install dependencies
console.log('Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Go to frontend directory and build
console.log('Going to frontend directory...');
process.chdir('./frontend');
console.log('Current directory (should be frontend):', process.cwd());
console.log('Files in frontend directory:', fs.readdirSync('.'));

// Install frontend dependencies
console.log('Installing frontend dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build frontend
console.log('Building frontend...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!');