import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseQuote } from '../src/quotes.js';
import { createStore } from '../src/storage.js';
const pool=[{id:'a',scholarId:'s'},{id:'b',scholarId:'s'},{id:'c',scholarId:'s'},{id:'other',scholarId:'other'}];
function memory(raw=null){return {raw,getItem(){return this.raw;},setItem(_,value){this.raw=value;}};}
test('prefer unseen quotes and avoid immediate repeat once all discovered',()=>{const save=memory(),store=createStore(save);let prior;for(let i=0;i<8;i++){const pick=chooseQuote(pool,'s',store.data.collection.s,()=>0);assert.notEqual(pick.quote.id,prior);assert.equal(pick.isNewQuote,i<3);store.discover('s',pick.quote.id);prior=pick.quote.id;}assert.equal(store.data.collection.s.count,8);assert.equal(store.data.collection.s.quoteIds.length,3);assert.equal(createStore(save).data.collection.s.lastQuoteId,prior);});
test('old save keeps scores/counts/date and begins a fresh quote collection',()=>{const save=memory(JSON.stringify({schemaVersion:1,bestScore:255,mute:true,collection:{s:{firstUnlockedAt:'2026-10-03T00:00:00Z',count:2}}})),store=createStore(save);const pick=chooseQuote(pool,'s',store.data.collection.s,()=>0);assert.equal(pick.isNewQuote,true);assert.equal(store.discover('s',pick.quote.id),false);assert.equal(store.data.bestScore,255);assert.equal(store.data.collection.s.count,3);assert.equal(store.data.collection.s.firstUnlockedAt,'2026-10-03T00:00:00Z');assert.deepEqual(createStore(save).data.collection.s.quoteIds,['a']);});
test('quote deduplication and missing/single pools stay playable',()=>{const store=createStore(memory());store.discover('s','a');store.discover('s','a');assert.deepEqual(store.data.collection.s.quoteIds,['a']);assert.equal(chooseQuote(pool,'missing',null),null);const pick=chooseQuote([{id:'a',scholarId:'s'}],'s',store.data.collection.s);assert.equal(pick.quote.id,'a');assert.equal(pick.isNewQuote,false);});
test('unrecognized quote history never deletes the old scholar collection',()=>{const save=memory(JSON.stringify({schemaVersion:1,bestScore:10,mute:false,collection:{s:{count:4,firstUnlockedAt:'2026-01-01',quoteIds:['retired','a','a',null],lastQuoteId:9}}})),store=createStore(save);assert.equal(store.available,true);assert.equal(store.data.collection.s.count,4);assert.deepEqual(store.data.collection.s.quoteIds,['retired','a']);assert.equal(chooseQuote(pool,'s',store.data.collection.s,()=>0).quote.id,'b');});
test('failed persistence still rotates quotes during this session',()=>{const store=createStore({getItem(){return null;},setItem(){throw Error('blocked');}});store.discover('s','a');assert.equal(store.available,false);assert.equal(chooseQuote(pool,'s',store.data.collection.s,()=>0).quote.id,'b');});

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const content=JSON.parse(readFileSync(new URL('../data/quotes.json',import.meta.url))).quotes;
const people=JSON.parse(readFileSync(new URL('../data/scholars.json',import.meta.url))).scholars;
test('education/research collection has at least ten distinct sourced lines per scholar',()=>{
  assert.equal(new Set(content.map(q=>q.id)).size,content.length);
  for(const person of people){const lines=content.filter(q=>q.scholarId===person.id);assert.ok(lines.length>=10,person.id);assert.equal(new Set(lines.map(q=>q.text)).size,lines.length);assert.ok(new Set(lines.map(q=>q.topic)).size>=4,person.id+' needs varied topics');}
  for(const q of content){assert.ok(people.some(s=>s.id===q.scholarId));for(const field of ['text','original','context','sourceTitle','topic','application','checkedAt'])assert.ok(typeof q[field]==='string'&&q[field].trim(),q.id+' '+field);assert.ok(['translation','original'].includes(q.kind));assert.equal(new URL(q.sourceUrl).protocol,'https:');}
});
test('retained legacy quote ids still identify the same original wording and scholar',()=>{
  const legacy=JSON.parse(readFileSync(new URL('./fixtures/quote-history-v0.2.0.json',import.meta.url)));
  for(const old of legacy){const current=content.find(q=>q.id===old.id);if(current){assert.equal(current.scholarId,old.scholarId);assert.equal(createHash('sha256').update(current.original).digest('hex'),old.originalHash,old.id+' must use a new id for a replacement');}}
});
test('expanded real collection reveals each new line before repeating across saved sessions',()=>{
  for(const person of people){const save=memory();const total=content.filter(q=>q.scholarId===person.id).length;const seen=new Set();let previous;
    for(let i=0;i<total+3;i++){const store=createStore(save),pick=chooseQuote(content,person.id,store.data.collection[person.id],()=>.57);assert.equal(pick.quote.scholarId,person.id);assert.notEqual(pick.quote.id,previous);assert.equal(pick.isNewQuote,i<total);if(i<total)assert.ok(!seen.has(pick.quote.id));seen.add(pick.quote.id);store.discover(person.id,pick.quote.id);previous=pick.quote.id;}
    assert.equal(seen.size,total);assert.equal(createStore(save).data.collection[person.id].count,total+3);
  }
});
