#!/usr/bin/env node
// Minimal webpack shim used to satisfy CI workflows that call `npx webpack`.
// It invokes the project's npm build script (next build) to keep behavior consistent.

import { spawnSync } from 'node:child_process';

const result = spawnSync('npm', ['run', 'build', '--silent'], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status || 0);
