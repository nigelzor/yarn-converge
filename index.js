#!/usr/bin/env node
const fs = require('fs');
const lockfile = require('@yarnpkg/lockfile');
const npa = require('npm-package-arg');
const semver = require('semver');

if (process.argv.length !== 3) {
  console.log('usage: yarn-converge /path/to/yarn.lock');
  process.exit(1);
}

const filename = process.argv[2];
const content = lockfile.parse(fs.readFileSync(filename, 'utf8'));

if (!content || content.type !== 'success') {
  console.log('failed to read ' + filename);
  process.exit(1);
}

const packages = {};
for (const dependency of Object.keys(content.object)) {
  const version = content.object[dependency].version;
  const parsed = npa(dependency);
  if (parsed.name && (parsed.type === 'range' || parsed.type === 'version')) {
    if (!packages[parsed.name]) {
      packages[parsed.name] = [];
    }
    packages[parsed.name].push({ spec: parsed.fetchSpec, version });
  }
}

for (const name of Object.keys(packages)) {
  const versions = new Set();
  for (const p of packages[name]) {
    versions.add(p.version);
  }
  if (versions.size > 1) {
    const sorted = [...versions].sort(semver.rcompare);
    for (const p of packages[name]) {
      for (const v of sorted) {
        if (v === p.version) {
          break;
        }
        if (semver.satisfies(v, p.spec)) {
          console.log(name, p.spec, 'could be upgraded to', v);
          break;
        }
      }
    }
  }
}
