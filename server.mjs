import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(root + sep) || (!['.html', '.css', '.js', '.json', '.svg', '.png'].includes(extname(path)))) { res.writeHead(403).end(); return; }
    res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-cache' }).end(await readFile(path));
  } catch { res.writeHead(404).end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', function () { console.log('思想淘金記：http://127.0.0.1:' + this.address().port); });
