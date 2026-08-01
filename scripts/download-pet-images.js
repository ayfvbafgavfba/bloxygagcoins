const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const front = path.join(__dirname, '..', 'growcsn-frontend');
const pvPath = path.join(front, 'src', 'assets', 'pet-values.json');
const outDir = path.join(front, 'public', 'img', 'items');

if (!fs.existsSync(pvPath)) {
  console.error('pet-values.json not found at', pvPath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let petValues;
let items = [];
try {
  petValues = JSON.parse(fs.readFileSync(pvPath, 'utf8'));
  items = petValues.items || [];
} catch (err) {
  console.warn('Failed to parse JSON, falling back to regex extraction:', err.message);
  const text = fs.readFileSync(pvPath, 'utf8');
  const re = /"image_url"\s*:\s*"([^"\\]+)"/g;
  const found = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    found.add(m[1]);
  }
  items = Array.from(found).map((img) => ({ image_url: img }));
}

function download(full, dest) {
  return new Promise((resolve, reject) => {
    const lib = full.startsWith('https') ? https : http;
    const req = lib.get(full, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('Status ' + res.statusCode));
      }
      const contentType = String(res.headers['content-type'] || '').toLowerCase();
      if (!contentType.startsWith('image/')) {
        res.resume();
        return reject(new Error('Not an image: ' + contentType));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    req.on('error', reject);
  });
}

(async () => {
  console.log('Found', items.length, 'items');
  for (const it of items) {
    const src = it.image_url;
    if (!src) continue;
    const full = src.startsWith('http') ? src : 'https://growagarden.roflips.com' + (src.startsWith('/') ? '' : '/') + src;
    const fileName = path.basename(full).split('?')[0];
    const dest = path.join(outDir, fileName);
    try {
      let validImage = false;
      if (fs.existsSync(dest)) {
        const header = fs.readFileSync(dest).subarray(0, 8);
        const isPng = header.length >= 8 && header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
        const isWebp = header.length >= 12 && header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
        validImage = isPng || isWebp;
      }
      if (!validImage) {
        console.log('Downloading', fileName);
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        await download(full, dest);
      }
      // also copy to public root so components referencing /<file> still work
      const rootDest = path.join(front, 'public', fileName);
      if (!fs.existsSync(rootDest)) {
        try { fs.copyFileSync(dest, rootDest); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      console.error('Failed', full, e.message);
    }
  }

  console.log('Saved images to', outDir);
})();
