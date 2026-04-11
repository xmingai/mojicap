import fs from 'fs';
import path from 'path';

const files = [
  'combos-data.json',
  'kaomoji-data.json',
  'ascii-art-data.json',
  'dividers-data.json'
];

for (const file of files) {
  const filePath = path.join('../src/data', file);
  if (!fs.existsSync(filePath)) continue;
  
  const uniqueNames = new Set();
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const category of data) {
    const list = category.combos || category.items;
    if (list) {
      for (const item of list) {
        if (item.name) uniqueNames.add(item.name);
      }
    }
  }
  console.log(`\n--- ${file} ---`);
  console.log(`Unique names: ${uniqueNames.size}`);
  if (uniqueNames.size > 0 && uniqueNames.size < 50) {
     console.log(Array.from(uniqueNames));
  } else {
     console.log('Sample:', Array.from(uniqueNames).slice(0, 10));
  }
}
