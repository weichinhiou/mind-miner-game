import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('preview server serves the complete favicon set and branded metadata', { timeout: 10000 }, async t => {
  const server = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => server.kill());
  const [output] = await once(server.stdout, 'data');
  const url = String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];

  const missing = await fetch(url + '/assets/scene/not-present.png');
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), 'Not found');

  const home = await fetch(url + '/');
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /思想淘金記/);
  assert.match(html, /rel="icon" type="image\/x-icon" href="\.\/favicon\.ico\?v=2"/);
  assert.match(html, /rel="icon" type="image\/png" sizes="512x512" href="\.\/favicon\.png\?v=2"/);
  assert.match(html, /rel="apple-touch-icon" sizes="180x180" href="\.\/apple-touch-icon\.png\?v=2"/);
  assert.match(html, /property="og:image" content="https:\/\/weichinhiou\.github\.io\/mind-miner-game\/assets\/branding\/og-image\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);

  for (const path of [
    '/favicon.ico',
    '/favicon.png',
    '/favicon-transparent.ico',
    '/favicon-transparent.png',
    '/apple-touch-icon.png',
    '/assets/branding/favicon.png',
    '/assets/branding/og-image.png',
    '/assets/scene/miner-cat.png'
  ]) {
    const asset = await fetch(url + path);
    assert.equal(asset.status, 200, path);
    assert.equal(asset.headers.get('content-type'), path.endsWith('.ico') ? 'image/x-icon' : 'image/png', path);
    const bytes = Buffer.from(await asset.arrayBuffer());
    if (path.endsWith('.ico')) assert.equal(bytes.readUInt16LE(4), 4, 'ICO must include 16/32/48/64px sizes');
    if (path === '/favicon-transparent.png') assert.equal(bytes[25], 6, 'transparent favicon must use RGBA PNG');
  }
});