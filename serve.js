#!/usr/bin/env node
// Serve script that uses PORT environment variable
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '8080';
const buildDir = path.join(__dirname, 'build');

console.log(`Starting server on port ${PORT}`);

const serve = spawn('npx', ['serve', '-s', buildDir, '-l', PORT], {
  stdio: 'inherit',
  shell: true
});

serve.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serve.on('exit', (code) => {
  process.exit(code);
});

