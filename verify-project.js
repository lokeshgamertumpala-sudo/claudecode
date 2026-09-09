#!/usr/bin/env node
/**
 * Claude Code Cross-File Interconnection & Integrity Verifier
 * Validates syntax, relative file imports, export symmetry, and package dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.gemini',
  '.claude',
  '__pycache__',
  'dist',
  'build',
  '.expo',
  'coverage'
]);

const JS_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        getAllFiles(path.join(dir, entry.name), fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (JS_EXTS.includes(ext) || ext === '.json' || ext === '.html') {
        fileList.push(path.join(dir, entry.name));
      }
    }
  }
  return fileList;
}

function resolveRelativeImport(sourceFile, importPath) {
  const sourceDir = path.dirname(sourceFile);
  const basePath = path.resolve(sourceDir, importPath);

  // Exact path or with extensions
  const candidates = [
    basePath,
    ...JS_EXTS.map(ext => basePath + ext),
    basePath + '.json',
    ...JS_EXTS.map(ext => path.join(basePath, 'index' + ext)),
    path.join(basePath, 'index.json')
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return cand;
    }
  }
  return null;
}

function parseImportsAndExports(filePath, content) {
  const imports = [];
  const namedExports = new Set();
  let hasDefaultExport = false;

  // Match import statements: import ... from '...'
  const importRegex = /(?:import\s+(?:([\w*\s{},$]+)\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const clause = match[1] || '';
    const importSource = match[2] || match[3];
    if (!importSource) continue;

    const importedMembers = [];
    let isDefault = false;

    if (clause) {
      if (clause.includes('{')) {
        const braceMatch = clause.match(/\{([^}]+)\}/);
        if (braceMatch) {
          braceMatch[1].split(',').forEach(s => {
            const clean = s.trim().split(/\s+as\s+/)[0].trim();
            if (clean) importedMembers.push(clean);
          });
        }
      }
      // Check default import
      const beforeBrace = clause.split('{')[0].trim().replace(/,$/, '').trim();
      if (beforeBrace && beforeBrace !== '*') {
        isDefault = true;
      }
    }

    imports.push({
      source: importSource,
      isRelative: importSource.startsWith('.'),
      importedMembers,
      isDefault
    });
  }

  // Detect exports in file
  if (/export\s+default\b/.test(content) || /module\.exports\s*=/.test(content)) {
    hasDefaultExport = true;
  }

  const exportNamedRegex = /export\s+(?:const|let|var|function\*?|class)\s+([a-zA-Z0-9_$]+)/g;
  let expMatch;
  while ((expMatch = exportNamedRegex.exec(content)) !== null) {
    namedExports.add(expMatch[1]);
  }

  const exportBlockRegex = /export\s*\{([^}]+)\}/g;
  let blockMatch;
  while ((blockMatch = exportBlockRegex.exec(content)) !== null) {
    blockMatch[1].split(',').forEach(s => {
      const clean = s.trim().split(/\s+as\s+/)[0].trim();
      if (clean) namedExports.add(clean);
    });
  }

  return { imports, namedExports, hasDefaultExport };
}

function verifyProject(targetDir = process.cwd()) {
  console.log(`\n======================================================`);
  console.log(`   🔍 CLAUDE CODE CROSS-FILE INTEGRITY VERIFIER`);
  console.log(`   Target Directory: ${targetDir}`);
  console.log(`======================================================\n`);

  const allFiles = getAllFiles(targetDir);
  const jsFiles = allFiles.filter(f => JS_EXTS.includes(path.extname(f).toLowerCase()));

  console.log(`[*] Discovered ${jsFiles.length} source code files. Analyzing dependencies...\n`);

  // Load package.json if present
  let declaredDependencies = new Set();
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.dependencies) Object.keys(pkg.dependencies).forEach(d => declaredDependencies.add(d));
      if (pkg.devDependencies) Object.keys(pkg.devDependencies).forEach(d => declaredDependencies.add(d));
      if (pkg.peerDependencies) Object.keys(pkg.peerDependencies).forEach(d => declaredDependencies.add(d));
    } catch (e) {
      console.warn(`[!] Warning: Failed to parse package.json: ${e.message}`);
    }
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalImports = 0;

  // 1. Syntax Check
  console.log(`[1/3] Checking syntax on all JS/TS files...`);
  for (const file of jsFiles) {
    const ext = path.extname(file).toLowerCase();
    if (['.js', '.mjs', '.cjs'].includes(ext)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hasJSX = /<[A-Z][A-Za-z0-9]*\b|<div|<span|<button/.test(content);
        if (!hasJSX) {
          execSync(`node --check "${file}"`, { stdio: 'pipe' });
        }
      } catch (err) {
        totalErrors++;
        console.error(`  ❌ [SYNTAX ERROR] ${path.relative(targetDir, file)}:`);
        const stderr = err.stderr ? err.stderr.toString() : err.message;
        console.error(`     ${stderr.split('\n')[0]}`);
      }
    }
  }

  // 2. Cross-File Import & Export Resolution
  console.log(`\n[2/3] Verifying cross-file imports & export signatures...`);
  const fileData = new Map();

  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = parseImportsAndExports(file, content);
      fileData.set(file, data);
    } catch (e) {
      totalErrors++;
      console.error(`  ❌ [READ ERROR] Failed to read ${path.relative(targetDir, file)}: ${e.message}`);
    }
  }

  for (const [sourceFile, data] of fileData.entries()) {
    const relSource = path.relative(targetDir, sourceFile);

    for (const imp of data.imports) {
      totalImports++;

      if (imp.isRelative) {
        const resolvedPath = resolveRelativeImport(sourceFile, imp.source);

        if (!resolvedPath) {
          totalErrors++;
          console.error(`  ❌ [ORPHANED IMPORT] In '${relSource}':`);
          console.error(`     Imports '${imp.source}' -> TARGET FILE DOES NOT EXIST ON DISK!`);
        } else {
          // Verify named export matching
          const targetData = fileData.get(resolvedPath);
          if (targetData && imp.importedMembers.length > 0) {
            for (const member of imp.importedMembers) {
              if (!targetData.namedExports.has(member) && !targetData.hasDefaultExport) {
                totalWarnings++;
                console.warn(`  ⚠️  [EXPORT MISMATCH] In '${relSource}':`);
                console.warn(`     Imports '{ ${member} }' from '${path.relative(targetDir, resolvedPath)}', but member was not explicitly exported.`);
              }
            }
          }
        }
      } else {
        // Third-party package import
        if (declaredDependencies.size > 0) {
          let pkgName = imp.source;
          if (pkgName.startsWith('@')) {
            pkgName = pkgName.split('/').slice(0, 2).join('/');
          } else {
            pkgName = pkgName.split('/')[0];
          }

          const nodeBuiltins = new Set(['fs', 'path', 'os', 'child_process', 'http', 'https', 'crypto', 'events', 'stream', 'util', 'url', 'assert']);
          if (!nodeBuiltins.has(pkgName) && !declaredDependencies.has(pkgName)) {
            totalWarnings++;
            console.warn(`  ⚠️  [UNLISTED DEPENDENCY] In '${relSource}':`);
            console.warn(`     Imports '${pkgName}', but it is not listed in package.json.`);
          }
        }
      }
    }
  }

  // 3. Summary Report
  console.log(`\n[3/3] Integrity Assessment Complete!`);
  console.log(`------------------------------------------------------`);
  console.log(`  Total Source Files:   ${jsFiles.length}`);
  console.log(`  Total Import Links:   ${totalImports}`);
  console.log(`  Errors Found:         ${totalErrors}`);
  console.log(`  Warnings Found:       ${totalWarnings}`);
  console.log(`------------------------------------------------------`);

  if (totalErrors === 0) {
    console.log(`\n✅ SUCCESS: Project integrity verified! 100% interconnected with ZERO errors.\n`);
    process.exit(0);
  } else {
    console.error(`\n❌ FAILED: ${totalErrors} architectural error(s) must be resolved.\n`);
    process.exit(1);
  }
}

const target = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
verifyProject(target);
