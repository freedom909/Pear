const fs = require('fs');
const path = require('path');

// Recursively scan directories for .ts files
function getAllFiles(dir) {
  let files = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Match named imports from express
// e.g. import { Request, Response } from 'express';
const importRegex = /^(\s*)import\s+{\s*([^}]*)\s*}\s+from\s+['"]express['"];/gm;

function addTypeToExpressImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const newContent = content.replace(
    importRegex,
    `$1import type { $2 } from 'express';`
  );

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated types in: ${filePath}`);
  }
}

// Run the script
const srcDir = path.join(__dirname, '..', 'src');
getAllFiles(srcDir).forEach(addTypeToExpressImports);

console.log('✅ Done updating express imports.');
