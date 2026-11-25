'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const CATALOG_FILE = path.join(ROOT, 'data', 'catalog.json');
const ORDERS_ENABLED = process.env.ORDERS_ENABLED === 'true';

function sendJson(res, status, value) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(JSON.stringify(value));
}

function getCatalog() {
  try {
    const parsed = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    return {
      banner: parsed.banner || {},
      games: Array.isArray(parsed.games) ? parsed.games.filter(item => item && item.enabled === true) : [],
      support: parsed.support || {}
    };
  } catch (error) {
    console.error('catalog_read_failed');
    return { banner: {}, games: [], support: {} };
  }
}

function mimeType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  })[ext] || 'application/octet-stream';
}

function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const relative = (decoded === '/' ? '/index.html' : decoded).replace(/^\/+/, '');
  const root = path.resolve(PUBLIC_DIR);
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      });
      return res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
    }
    res.writeHead(200, {
      'Content-Type': mimeType(file),
      'Cache-Control': path.basename(file) === 'index.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    if (req.method === 'HEAD') return res.end();
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = url.pathname;

  if (route.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    if (route === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        ok: true,
        app: 'ZENO API',
        version: '1.2.0',
        status: 'preview',
        ordersEnabled: ORDERS_ENABLED,
        catalogItems: getCatalog().games.length
      });
    }

    if (route === '/api/catalog' && req.method === 'GET') {
      return sendJson(res, 200, getCatalog());
    }

    if (route === '/api/orders' && req.method === 'POST') {
      return sendJson(res, 503, {
        code: 'orders_disabled',
        message: 'Checkout is not enabled in this preview.'
      });
    }

    if (route.startsWith('/api/orders/') && req.method === 'GET') {
      return sendJson(res, 404, { code: 'not_found' });
    }

    return sendJson(res, 404, { code: 'not_found' });
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405);
    return res.end();
  }

  return serveStatic(req, res, route);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('ZENO API listening on port ' + PORT + '; ordersEnabled=' + ORDERS_ENABLED);
});
