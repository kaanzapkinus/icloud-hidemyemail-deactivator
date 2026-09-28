// Builds a test-only copy of the extension in tests/dist-ext/ with
// http://127.0.0.1/* + http://localhost/* matches so E2E tests can run the
// real extension against the local mock (tests/mock-icloud). The shipping
// manifest at the repo root is never modified.
//
// Usage:  bun tests/build-test-ext.mjs   (also works: node tests/build-test-ext.mjs)
// Output: prints the absolute path of tests/dist-ext as its last line.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const distDir = join(scriptDir, 'dist-ext');

const TEST_MATCHES = ['http://127.0.0.1/*', 'http://localhost/*'];
const REQUIRED_FILES = ['manifest.json', 'content.js', 'popup.html', 'popup.js', 'popup.css'];
const OPTIONAL_DIRS = ['icons'];

function fail(msg) {
  console.error(`[build-test-ext] ERROR: ${msg}`);
  process.exit(1);
}

// Wipe first so repeated runs are idempotent (no stale files).
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const copied = [];
for (const file of REQUIRED_FILES) {
  const src = join(repoRoot, file);
  if (!existsSync(src)) fail(`missing required source file: ${file}`);
  cpSync(src, join(distDir, file));
  copied.push(file);
}
for (const dir of OPTIONAL_DIRS) {
  const src = join(repoRoot, dir);
  if (existsSync(src)) {
    cpSync(src, join(distDir, dir), { recursive: true });
    copied.push(dir + '/');
  }
}

const manifestPath = join(distDir, 'manifest.json');
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (err) {
  fail(`cannot parse manifest.json: ${err.message}`);
}

if (!Array.isArray(manifest.content_scripts) || !manifest.content_scripts[0]) {
  fail('manifest.json has no content_scripts[0] to patch');
}

const addUnique = (list, values) => {
  for (const v of values) if (!list.includes(v)) list.push(v);
};

manifest.content_scripts[0].matches = manifest.content_scripts[0].matches || [];
addUnique(manifest.content_scripts[0].matches, TEST_MATCHES);
manifest.host_permissions = manifest.host_permissions || [];
addUnique(manifest.host_permissions, TEST_MATCHES);
manifest.version = `${manifest.version}.1`; // valid: 1-4 dot-separated integers (Chrome rejects "-test" suffix)

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`[build-test-ext] copied: ${copied.join(', ')}`);
console.log(`[build-test-ext] patched: content_scripts[0].matches += ${TEST_MATCHES.join(' , ')}`);
console.log(`[build-test-ext] patched: host_permissions += ${TEST_MATCHES.join(' , ')}`);
console.log(`[build-test-ext] patched: version -> ${manifest.version}`);
console.log(distDir);
