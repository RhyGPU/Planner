#!/usr/bin/env node

/**
 * OmniPlan Development Server Launcher
 * Cross-platform script to start the Vite dev server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting OmniPlan Development Server...');
console.log('📍 Listening on http://localhost:5173\n');
console.log('Press Ctrl+C to stop the server\n');

// Determine OS and use appropriate npm command
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npm.cmd' : 'npm';

const server = spawn(command, ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

server.on('close', (code) => {
  console.log('\n✋ Development server stopped');
  process.exit(code || 0);
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle signals gracefully
process.on('SIGINT', () => {
  server.kill();
});

process.on('SIGTERM', () => {
  server.kill();
});
