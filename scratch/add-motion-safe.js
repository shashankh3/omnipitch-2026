import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.vue')) {
      results.push(file);
    }
  });
  return results;
};

const vueFiles = walk(path.join(__dirname, '../src'));

vueFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /(?<!motion-safe:)animate-([a-z-]+)/g;
  if (regex.test(content)) {
    console.log(`Updating ${file}`);
    content = content.replace(regex, 'motion-safe:animate-$1');
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Done!');
