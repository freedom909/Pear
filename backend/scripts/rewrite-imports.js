const fs = require('fs');
const path = require('path');

// 🔧 Define your rewrite rules here:
const rules = [
  {
    matchPackage: /^express$/, // match any imports from 'express'
    action: (importStatement) =>
      importStatement.replace(
        /^(\s*)import\s+{\s*([^}]*)\s*}\s+from\s+['"]express['"];/gm,
        `$1import type { $2 } from 'express';`
      ),
  },
  {
    matchPackage: /^\.\/|^\.\.\//, // match relative imports
    action: (importStatement) =>
      importStatement.replace(
        /from\s+['"]([^'"]+)['"]/gm,
        (m, p) => `from '${p}.js'` // add .js extension to relative imports
      ),
  },
  {
    matchPackage: /^old-package$/, // match a particular package
    action: (importStatement) =>
      importStatement.replace(
        /from\s+['"]old-package['"]/gm,
        `from 'new-package'` // replace old-package with new-package
      ),
  },
];

// Get all files under a directory recursively
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

// Apply all import-rewrite rules
function rewriteImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const { matchPackage, action } of rules) {
    const importRegex = new RegExp(
      `^.*from\\s+['"](${matchPackage.source})['"];?`,
      'gm'
    );

    if (importRegex.test(content)) {
      content = action(content);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

// Run
const srcDir = path.join(__dirname, '..', 'src');
getAllFiles(srcDir).forEach(rewriteImports);

console.log('🎉 Rewrite complete.');
