const fs = require('fs');
const path = require('path');

// Recursively scan a directory for .ts files
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

// Regex for import statements
const importRegex = /\b(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g;

function addJSExtension(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const newContent = content.replace(
    importRegex,
    (match, from, importPath, quote) => {
      // Check if importPath already contains a file extension
      if (/\.[^/]+$/.test(importPath)) {
        return match; // do not modify
      }
      return `${from}${importPath}.js${quote}`;
    }
  );

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

// Run the script
const srcDir = path.join(__dirname, '..', 'src');
getAllFiles(srcDir).forEach(addJSExtension);

console.log('✅ Done updating import paths.');
