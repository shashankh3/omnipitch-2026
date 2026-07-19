import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIMIT_KB = 650;
const LIMIT_BYTES = LIMIT_KB * 1024;
const DIST_DIR = path.join(__dirname, '../dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist directory not found. Did you run npm run build?');
  process.exit(1);
}

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        filesList.push(filePath);
      }
    }
  }
  return filesList;
}

const targetFiles = getFiles(DIST_DIR);
let totalGzipSize = 0;

for (const file of targetFiles) {
  const content = fs.readFileSync(file);
  const gzipped = zlib.gzipSync(content);
  totalGzipSize += gzipped.length;
}

const totalSizeKB = (totalGzipSize / 1024).toFixed(2);
console.log(`Total gzipped bundle size: ${totalSizeKB} KB`);

if (Math.round(totalGzipSize / 1024) > LIMIT_KB) {
  console.error(`\nError: Bundle size exceeds limit of ${LIMIT_KB} KB!`);
  process.exit(1);
}

console.log('Bundle size is within the limit. \u2705');
process.exit(0);
