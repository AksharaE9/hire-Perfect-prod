import fs from 'fs';
import path from 'path';

const searchDirs = ['app', 'components', 'src', 'lib'];

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js', '.css', '.mjs']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = searchDirs.flatMap(d => getAllFiles(d));
console.log(`Total files scanned: ${files.length}`);

let darkVariantCount = 0;
let darkBgCount = 0;
let lightTextCount = 0;
let darkHexCount = 0;
let prefersColorSchemeCount = 0;
let darkSelectorCount = 0;
let dataThemeCount = 0;
let themeStorageCount = 0;

const darkBgMatches = [];
const darkVariantMatches = [];
const lightTextMatches = [];

const darkBgRegex = /\bbg-(slate|gray|zinc|neutral|stone|navy)-(8|9)00\b|\bbg-black\b|\bbg-\[#(0[0-9a-fA-F]{5}|1[0-9a-fA-F]{5}|2[0-9a-fA-F]{5})\]/g;
const darkVariantRegex = /\bdark:/g;
const lightTextRegex = /\btext-white\b|\btext-(slate|gray|zinc)-(1|2|3)00\b/g;
const darkHexRegex = /#(0[0-9a-fA-F]{5}|1[0-9a-fA-F]{5}|2[0-9a-fA-F]{5})/g;
const themeStorageRegex = /(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\s*\(\s*['"][^'"]*(theme|mode|dark)/gi;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const dv = line.match(darkVariantRegex);
    if (dv) {
      darkVariantCount += dv.length;
      darkVariantMatches.push({ file, line: idx + 1, content: line.trim() });
    }

    const dbg = line.match(darkBgRegex);
    if (dbg) {
      darkBgCount += dbg.length;
      darkBgMatches.push({ file, line: idx + 1, content: line.trim() });
    }

    const lt = line.match(lightTextRegex);
    if (lt) {
      lightTextCount += lt.length;
      lightTextMatches.push({ file, line: idx + 1, content: line.trim() });
    }

    const dh = line.match(darkHexRegex);
    if (dh) {
      darkHexCount += dh.length;
    }

    if (line.includes('prefers-color-scheme')) {
      prefersColorSchemeCount++;
    }

    if (/\.dark\b/.test(line)) {
      darkSelectorCount++;
    }

    if (line.includes('data-theme')) {
      dataThemeCount++;
    }

    const ts = line.match(themeStorageRegex);
    if (ts) {
      themeStorageCount += ts.length;
    }
  });
}

console.log('\n--- GATE B AUDIT RESULTS ---');
console.log(`1. 'dark:' variants: ${darkVariantCount}`);
console.log(`2. Dark background utilities (bg-slate-800/900, bg-black, etc): ${darkBgCount}`);
console.log(`3. Light text utilities (text-white, text-slate-100/200/300): ${lightTextCount}`);
console.log(`4. Dark hex literals (#000, #14203A, etc): ${darkHexCount}`);
console.log(`5. prefers-color-scheme queries: ${prefersColorSchemeCount}`);
console.log(`6. .dark selectors in CSS/JS: ${darkSelectorCount}`);
console.log(`7. data-theme attributes: ${dataThemeCount}`);
console.log(`8. Theme storage keys in localStorage/sessionStorage: ${themeStorageCount}`);

console.log('\n--- TOP FILES WITH DARK BACKGROUND UTILITIES ---');
const fileBgTally = {};
darkBgMatches.forEach(m => { fileBgTally[m.file] = (fileBgTally[m.file] || 0) + 1; });
Object.entries(fileBgTally).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([f, count]) => {
  console.log(`  ${count.toString().padStart(3, ' ')} in ${f}`);
});
