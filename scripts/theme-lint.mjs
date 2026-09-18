#!/usr/bin/env node

/**
 * HirePerfect Theme Lint Script
 * Enforces a strict single light-theme policy across the repository.
 * Fails if any dark mode constructs, disallowed dark classes, or unapproved selectors are detected.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'src', 'lib'];
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.mjs'];

// Allowed files for specific patterns (e.g. root token files, layout cleanup)
const ALLOWED_HEX_FILES = [
  path.join(ROOT, 'app', 'globals.css'),
  path.join(ROOT, 'tailwind.config.ts'),
  path.join(ROOT, 'scripts', 'theme-lint.mjs'),
  path.join(ROOT, 'scripts', 'inventory-theme.mjs'),
];

function getAllFiles(dir) {
  let results = [];
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(path.relative(ROOT, fullPath)));
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = SCAN_DIRS.flatMap(getAllFiles);
let errors = [];

// 1. Check Tailwind config for darkMode
const tailwindConfigPath = path.join(ROOT, 'tailwind.config.ts');
if (fs.existsSync(tailwindConfigPath)) {
  const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');
  if (tailwindContent.includes('darkMode')) {
    errors.push({
      file: 'tailwind.config.ts',
      line: 1,
      reason: 'darkMode configuration is disallowed. HirePerfect is strictly a light-theme product.',
    });
  }
}

// 2. Scan component & source files
for (const file of files) {
  const relativePath = path.relative(ROOT, file);
  const isAllowedHex = ALLOWED_HEX_FILES.some((f) => path.resolve(file) === path.resolve(f));
  const isLayoutFile = relativePath === 'app/layout.tsx';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Check for dark: variants
    if (/\bdark:/g.test(trimmed)) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found prohibited 'dark:' Tailwind variant: "${trimmed}"`,
      });
    }

    // Check for prefers-color-scheme
    if (trimmed.includes('prefers-color-scheme')) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found prohibited '@media (prefers-color-scheme)' query: "${trimmed}"`,
      });
    }

    // Check for .dark selectors in CSS or JS (excluding layout cleanup)
    if (/\.dark\b/g.test(trimmed) && !isLayoutFile) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found prohibited '.dark' CSS class or selector: "${trimmed}"`,
      });
    }

    // Check for dark theme library classes (e.g. ag-theme-alpine-dark)
    if (/ag-theme-[a-z]+-dark|dark-theme|theme-dark/gi.test(trimmed)) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found third-party dark theme class: "${trimmed}"`,
      });
    }

    // Check for raw bg-black
    if (/\bbg-black\b/g.test(trimmed)) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found 'bg-black'. Disallowed by design system; use 'bg-navy' or 'bg-paper': "${trimmed}"`,
      });
    }

    // Check for dark slate/gray background utilities
    if (/\bbg-(slate|gray|zinc|neutral|stone)-(8|9)00\b/g.test(trimmed)) {
      errors.push({
        file: relativePath,
        line: lineNum,
        reason: `Found dark background utility class: "${trimmed}"`,
      });
    }
  });
}

console.log('--- HIREPERFECT THEME LINT ---');
console.log(`Scanned ${files.length} files across ${SCAN_DIRS.join(', ')}.`);

if (errors.length > 0) {
  console.error(`\n❌ FAILED: Found ${errors.length} theme violation(s):\n`);
  errors.forEach((err) => {
    console.error(`  ${err.file}:${err.line} - ${err.reason}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ PASSED: Zero dark theme variants, selectors, or disallowed utilities found.');
  process.exit(0);
}
