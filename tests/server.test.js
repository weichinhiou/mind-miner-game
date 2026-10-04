import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('missing artwork returns 404 and the preview server continues serving the game', {timeout:10000}, async t=>{
  const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  t.after(()=>server.kill());
  const [output]=await once(server.stdout,'data');
  const url=String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
  const missing=await fetch(url+'/assets/scene/not-present.png');assert.equal(missing.status,404);assert.equal(await missing.text(),'Not found');
  const home=await fetch(url+'/');assert.equal(home.status,200);assert.match(await home.text(),/思想淘金記/);
  const art=await fetch(url+'/assets/scene/miner-cat.png');assert.equal(art.status,200);assert.equal(art.headers.get('content-type'),'image/png');await art.body.cancel();
});
