import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'static/content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

let totalCleaned = 0;

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.sections) {
    let changed = false;
    for (const section of data.sections) {
      if (section.wikiLinks) {
        const newLinks = {};
        for (const [key, url] of Object.entries(section.wikiLinks)) {
          // Clean the key: remove trailing punctuation and 's
          const cleanKey = key.replace(/[,.;:]+$/, '').replace(/'s$/i, '').trim();
          if (cleanKey !== key) {
            changed = true;
          }
          if (!newLinks[cleanKey]) {
            newLinks[cleanKey] = url;
          }
        }
        section.wikiLinks = newLinks;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      totalCleaned++;
      console.log(`Cleaned punctuation in ${file}`);
    }
  }
}

console.log(`Done. Cleaned ${totalCleaned} files.`);
