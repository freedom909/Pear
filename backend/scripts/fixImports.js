// scripts/fixImports.js
const fs = require('fs');
const path = require('path');

// Recursively process all JS files
function processDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return processDir(fullPath);

    if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Regex to match import/require of local files WITHOUT .js
      content = content.replace(
        /\b(require|from)\s*\(?["'](\.\/[^"']+)["']\)?/g,
        (match, keyword, importPath) => {
          // Append ".js" only if path doesn't already have an extension
          if (!path.extname(importPath)) {
            return keyword === 'require'
              ? `require("${importPath}.js")`
              : `from "${importPath}.js"`;
          }
          return match;
        }
      );

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed:', fullPath);
    }
  });
}

// Run on your output directory
processDir(path.join(__dirname, '..', 'dist'));
