import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '../src');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else {
      if (filePath.endsWith('.vue')) {
        filesList.push(filePath);
      }
    }
  }
  return filesList;
}

const targetFiles = getFiles(SRC_DIR);

for (const file of targetFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  content = content.replace(/text-white\/30/g, 'text-white/70');
  content = content.replace(/text-white\/35/g, 'text-white/70');
  content = content.replace(/text-white\/40/g, 'text-white/70');
  content = content.replace(/text-white\/45/g, 'text-white/70');
  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
console.log('Fixed contrast issues');
