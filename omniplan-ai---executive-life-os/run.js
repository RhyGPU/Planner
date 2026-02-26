#!/usr/bin/env node

/**
 * OmniPlan AI — Desktop App Launcher
 *
 * Double-click this file (or run: node run.js) to build and launch the app.
 * No terminal knowledge needed.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const cwd = __dirname;

function log(msg) {
  console.log('[OmniPlan] ' + msg);
}

// Check if node_modules exists
if (!fs.existsSync(path.join(cwd, 'node_modules'))) {
  log('First run - installing dependencies (one-time)...');
  execSync(npm + ' install', { cwd, stdio: 'inherit' });
}

// Check if dist/index.html exists — if not, build
const distIndex = path.join(cwd, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  log('Building app...');
  execSync(npm + ' run build', { cwd, stdio: 'inherit' });
}

// Launch Electron
log('Starting OmniPlan AI...');
const electron = require('electron');
const electronPath = typeof electron === 'string' ? electron : (electron.default || electron);

const child = spawn(electronPath, ['.'], {
  cwd,
  stdio: 'ignore',
  detached: true,
});

child.unref();
log('App launched. You can close this window.');

setTimeout(function() { process.exit(0); }, 500);
