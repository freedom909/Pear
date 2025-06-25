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

// Match imports like: import { Request, Response, NextFunction } from 'express';
const importRegex = /^(\s*)import\s+{\s*Request\s*,\s*Response\s*,\s*NextFunction\s*}\s+from\s+['"]express['"];/gm;

function addTypeToExpressImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const newContent = content.replace(
    importRegex,
    `$1import type { Request, Response, NextFunction } from 'express';`
  );

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated import types in: ${filePath}`);
  }
}

// Run the script
const srcDir = path.join(__dirname, '..', 'src');
getAllFiles(srcDir).forEach(addTypeToExpressImports);

console.log('✅ Done updating express imports.');
