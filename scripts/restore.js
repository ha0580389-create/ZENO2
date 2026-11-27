'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const bundleDir = path.join(root, '.bundle');
const payload = [1, 2, 3, 4].map(n => fs.readFileSync(path.join(bundleDir, 'part' + String(n).padStart(2, '0') + '.b64'), 'utf8').trim()).join('');
const project = JSON.parse(zlib.brotliDecompressSync(Buffer.from(payload, 'base64')).toString('utf8'));
for (const [relative, content] of Object.entries(project)) {
  const destination = path.resolve(root, relative);
  if (!destination.startsWith(root + path.sep)) throw new Error('Unsafe project path: ' + relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, 'utf8');
}
const appCreatorFile = path.join(root, 'AppCreator24', 'ZENO-AppCreator24-LIVE.html');
if (fs.existsSync(appCreatorFile)) {
  let hosted = fs.readFileSync(appCreatorFile, 'utf8');
  hosted = hosted.replace("API_BASE: 'https://YOUR-RENDER-SERVICE.onrender.com/api',", "API_BASE: window.location.origin + '/api',");
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public', 'index.html'), hosted, 'utf8');
}
process.stdout.write('Restored ' + Object.keys(project).length + ' ZENO files and generated hosted index.html\n');
