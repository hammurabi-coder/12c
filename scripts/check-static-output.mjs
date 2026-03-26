import fs from 'node:fs';
import path from 'node:path';

const docsDir = path.resolve('docs');

if (!fs.existsSync(docsDir)) {
  console.error('Static output check failed: docs/ does not exist. Run npm run build first.');
  process.exit(1);
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkHtml(dir) {
  /** @type {string[]} */
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtml(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

const htmlFiles = walkHtml(docsDir);
const localAssetPattern = /(?:href|src)\s*=\s*"((?:\.{1,2}\/)[^"]+)"|import\("((?:\.{1,2}\/)[^"]+)"\)/g;
/** @type {string[]} */
const missingAssets = [];

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');

  for (const match of html.matchAll(localAssetPattern)) {
    const assetRef = match[1] ?? match[2];
    const resolvedAsset = path.resolve(path.dirname(htmlFile), assetRef);

    if (!fs.existsSync(resolvedAsset)) {
      missingAssets.push(
        `${path.relative(process.cwd(), htmlFile)} -> ${assetRef}`
      );
    }
  }
}

if (missingAssets.length) {
  console.error('Static output check failed. Missing local assets:');
  for (const missingAsset of missingAssets) {
    console.error(`- ${missingAsset}`);
  }
  process.exit(1);
}

console.log(`Static output verified for ${htmlFiles.length} HTML file(s).`);
