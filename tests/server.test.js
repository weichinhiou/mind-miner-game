import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('preview server serves branded metadata and image assets', { timeout: 10000 }, async t => {
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
  assert.match(html, /rel="icon" type="image\/png" href="assets\/branding\/favicon\.png"/);
  assert.match(html, /property="og:image" content="https:\/\/weichinhiou\.github\.io\/mind-miner-game\/assets\/branding\/og-image\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);

  for (const path of [
    '/assets/branding/favicon.png',
    '/assets/branding/og-image.png',
    '/assets/scene/miner-cat.png'
  ]) {
    const asset = await fetch(url + path);
    assert.equal(asset.status, 200, path);
    assert.equal(asset.headers.get('content-type'), 'image/png', path);
    await asset.body.cancel();
  }
});
