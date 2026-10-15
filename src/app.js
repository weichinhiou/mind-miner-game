import { CONFIG } from './config.js';
import { Game } from './engine.js';
import { createStore } from './storage.js';
import { drawScene, loadSceneAssets } from './render.js';
import { chooseQuote } from './quotes.js';
const app = document.querySelector('#app');
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw Error('Unavailable'); } }; }
const store = createStore(storage);
let scholars = [], quotes = [], game = null, screen = 'loading', raf = null, lastTime = null, toastUntil = 0, toastText = '', audio = null, lastResult = null;
const activeSounds = new Set();
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scholarById = id => scholars.find(s => s.id === id);
const safeUrl = value => { try { const url = new URL(value); return ['http:','https:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
function link(value, label) { const url = safeUrl(value); return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>` : ''; }
function portal() { const url=safeUrl(CONFIG.portalUrl);return url?`<a class="portal" href="${escapeHtml(url)}">回任意門 ↗</a>`:''; }
function warning() { document.querySelector('#storage-warning').hidden = store.available; }
function stopSounds() { for (const osc of activeSounds) { try { osc.stop(); } catch {} } activeSounds.clear(); }
function enableAudio() { try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(()=>{}); } catch {} }
function sound(type) {
  if (store.data.mute || !audio || audio.state !== 'running') return;
  try {
    const tones = { fire:[250,180], smallGold:[640,880],mediumGold:[620,820],largeGold:[600,780],smallSilver:[520,680],mediumSilver:[480,620],largeSilver:[440,560],gem:[880,1200],book:[520,780,1040],smallScrap:[150,110],largeScrap:[110,75] }[type] || [440];
    tones.forEach((frequency,i)=> {const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(.0001,audio.currentTime+i*.08);gain.gain.exponentialRampToValueAtTime(.07,audio.currentTime+i*.08+.01);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+i*.08+.17);osc.connect(gain).connect(audio.destination);activeSounds.add(osc);osc.onended=()=>{activeSounds.delete(osc);osc.disconnect();gain.disconnect();};osc.start(audio.currentTime+i*.08);osc.stop(audio.currentTime+i*.08+.18);});
  } catch {}
}
function stopLoop() { if(raf!==null)cancelAnimationFrame(raf);raf=null;lastTime=null;stopSounds(); }
function view(html, name) {stopLoop();screen=name;app.innerHTML=html;app.setAttribute('aria-busy','false');warning();window.scrollTo(0,0);}
function portrait(s, mini=false) {
  const p=s.portrait;
  const initial=escapeHtml(s.nameZh.slice(0,1));
  if(!p?.src||!p.crop) return '<div class="portrait'+(mini?' mini-portrait':'')+'" aria-label="'+escapeHtml(s.nameZh)+'姓名卡">'+initial+'</div>';
  const {x,y,size}=p.crop;
  const style='width:'+(p.sheetWidth/size*100)+'%;left:'+(-x/size*100)+'%;top:'+(-y/size*100)+'%;';
  return '<div class="portrait with-image'+(mini?' mini-portrait':'')+'" role="img" aria-label="'+escapeHtml(s.portraitAlt)+'"><span aria-hidden="true">'+initial+'</span><img src="'+escapeHtml(p.src)+'" alt="" style="'+style+'" decoding="async"></div>';
}
function miniCards() {return scholars.map(s=>`<div class="mini-card ${store.data.collection[s.id]?'unlocked':''}">${store.data.collection[s.id]?portrait(s,true):'<span class="book-shape">▤</span>'}${store.data.collection[s.id]?escapeHtml(s.nameZh):'尚未發現'}</div>`).join('');}
const treasureAsset={gem:'gem.png',smallGold:'gold-small.png',mediumGold:'gold-medium.png',largeGold:'gold-large.png',smallSilver:'silver-small.png',mediumSilver:'silver-medium.png',largeSilver:'silver-large.png',book:'thought-book.png',smallScrap:'scrap-small.png',largeScrap:'scrap-large.png'};
function guideGroup(title,entries,className='') {return '<div class="guide-group '+className+'"><b>'+title+'</b><div class="guide-levels">'+entries.map(([type,label,score])=>'<span class="guide-level"><img src="assets/treasures/'+treasureAsset[type]+'" alt="" onerror="this.hidden=true"><span>'+label+'<small>'+score+' 分</small></span></span>').join('')+'</div></div>';}
function home() {
  game=null;
  view(`<section class="home-top"><div><span class="eyebrow">A LITTLE MINE. A WORLD OF IDEAS.</span><h1>思想淘金記</h1><p class="subtitle">挖出寶藏，也遇見一種新的眼光。</p></div><div class="best"><span>本機最高分</span><strong>${store.data.bestScore.toLocaleString()}</strong></div></section>
  <section class="home-layout"><div class="scene-frame"><canvas id="preview" aria-label="黑貓坐在礦坑上方，地下藏著金塊與思想藏書"></canvas><div class="scene-caption"><span>✦ 60 秒的地下探險 · ${quotes.length} 句教學與研究短句</span><span>看準方向，把寶藏帶回來。</span></div></div><aside class="intro-panel"><img class="hero-mascot" src="assets/scene/miner-cat.png" alt="戴著礦工帽、揮手迎接你的黑貓礦工" onerror="this.hidden=true"><span class="eyebrow">HOW TO PLAY</span><h2>一鉤寶藏，<br>一點新發現。</h2><ol class="instructions"><li><b>01</b>看準方向，點一下出鉤。</li><li><b>02</b>越重的寶物，拉回越慢。</li><li><b>03</b>挖到藏書，發現一句教學或研究短句。</li></ol><button class="primary" data-action="start">開始挖礦 →</button><button data-action="collection">思想收藏冊</button><small>桌機點擊／空白鍵 · 手機輕點<br>遊戲成績代表操作與取捨。</small>${portal()}</aside></section>
  <section class="treasure-guide"><span class="guide-heading">礦坑裡有什麼？<small>礦物越大分數越高；廢鐵會扣分且很重，清空寶物即可前往下一輪</small></span><div class="guide-groups">${guideGroup('金礦',[['smallGold','小','20'],['mediumGold','中','45'],['largeGold','大','80']],'gold')}${guideGroup('銀礦',[['smallSilver','小','15'],['mediumSilver','中','30'],['largeSilver','大','60']],'silver')}${guideGroup('寶石',[['gem','寶石','100']],'single')}${guideGroup('學者藏書',[['book','藏書','50']],'single book')}${guideGroup('廢鐵',[['smallScrap','小','−25'],['largeScrap','大','−60']],'scrap')}</div></section>
  <section><div class="section-title"><h2>等待發現的思想藏書</h2><span>${unlockedCount()} / ${scholars.length} 已收藏</span></div><div class="collection-preview">${miniCards()}</div></section>`, 'home');
  const preview=new Game({scholars:scholars.map(s=>s.id),random:seedRandom(42)});preview.hook.angle=.4;drawScene(document.querySelector('#preview'),preview,true);
}
function seedRandom(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function unlockedCount(){return scholars.filter(s=>Object.hasOwn(store.data.collection,s.id)).length;}
function card(s, result=false) {
  const found=store.data.collection[s.id];
  if(!found)return `<div class="scholar-card locked"><div class="portrait" aria-hidden="true">▤</div><h2>尚未發現</h2><p>一本藏書，等待你帶回地面。</p><small>在礦坑中尋找紫色藏書</small></div>`;
  const earned=lastResult?.finds.find(f=>f.id===s.id);
  return `<button class="scholar-card" data-scholar="${escapeHtml(s.id)}">${result&&earned?.isNew?'<span class="badge">NEW</span>':''}${portrait(s)}<h2>${escapeHtml(s.nameZh)}</h2><p>${escapeHtml(s.field)}</p><small>${result?`本局發現 ${earned?.count||0} 次`:`已發現 ${found.count} 次`} · ${quotes.filter(q=>q.scholarId===s.id&&(found.quoteIds||[]).includes(q.id)).length} / ${quotes.filter(q=>q.scholarId===s.id).length} 句 · 查看介紹 ↗</small></button>`;
}
function collection() {game=null;view(`<section class="page-heading"><div><span class="eyebrow">A SHELF OF NEW PERSPECTIVES</span><h1>思想收藏冊</h1><p>已收藏 ${unlockedCount()} / ${scholars.length} 位人物 · 短句已發現 ${quotes.filter(q=>(store.data.collection[q.scholarId]?.quoteIds||[]).includes(q.id)).length} / ${quotes.length} 句 · 收藏保存在此瀏覽器</p></div><button data-action="home">← 回首頁</button></section><div class="collection-grid">${scholars.map(s=>card(s)).join('')}</div>`, 'collection');}
function details(id) {
  const s=scholarById(id);if(!s||!store.data.collection[id])return;
  const dialog=document.createElement('dialog');
  dialog.innerHTML=`<button class="close" aria-label="關閉人物介紹">✕</button><span class="eyebrow">COLLECTED PERSPECTIVE</span>${portrait(s)}<h2>${escapeHtml(s.nameZh)}</h2><div class="english">${escapeHtml(s.nameEn)} · ${escapeHtml(s.lifeYearsLabel)}</div><p>${escapeHtml(s.field)}</p><p>${escapeHtml(s.intro)}</p><h3>視角摘要 · 編寫的方法轉譯</h3><p>${escapeHtml(s.lensSummary)}</p><div class="tags">${s.coreMethods.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><h3>帶走一個問題</h3><p>${escapeHtml(s.reflectionQuestion)}</p><p class="note">${escapeHtml(s.contentNote)}</p>${scholarQuotes(s)}<h3>人物資料來源</h3><ul class="source-list">${s.sources.map(source=>`<li>${link(source.url,escapeHtml(source.title))}</li>`).join('')}</ul><p class="note">PRD 資料查核日期：${escapeHtml(s.sourceCheckedAt)} · 方法摘要與問題為編寫內容。</p>${link(CONFIG.personaLensUrl,'開啟 Persona Lens ↗')}`;
  document.body.append(dialog);dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});dialog.showModal();
}
function quoteHtml(q, isNewQuote=false) {
  const original=q.kind==='translation'?'<p lang="en">'+escapeHtml(q.original)+'</p>':'';
  return '<article class="quote-entry">'+(isNewQuote?'<span class="badge">新發現</span>':'')+'<span class="quote-topic">'+escapeHtml(q.topic)+'</span><blockquote>'+escapeHtml(q.text)+'</blockquote><p class="quote-application"><span>教學／研究連結 · 編寫提示</span>'+escapeHtml(q.application)+'</p><details class="quote-original"><summary>查看原文與語境</summary>'+original+'<p>'+escapeHtml(q.context)+'</p></details><p class="note">'+escapeHtml(q.kind==='original'?'原文節錄':'原文節錄 · 本遊戲繁中編譯')+' · '+link(q.sourceUrl,escapeHtml(q.sourceTitle))+'</p></article>';
}
function scholarQuotes(s) {
  const pool=quotes.filter(q=>q.scholarId===s.id),seen=new Set(store.data.collection[s.id]?.quoteIds||[]);
  const unlocked=pool.filter(q=>seen.has(q.id)),remaining=pool.length-unlocked.length;
  return '<h3>教學與研究短句 · '+unlocked.length+' / '+pool.length+' 句已發現</h3>'+unlocked.map(q=>quoteHtml(q)).join('')+(remaining?'<p class="quote-locked">▤ 還有 '+remaining+' 句待發現 · 再帶回一本藏書，遇見一句話。</p>':'');
}
function roundQuotes() {
  return '<section class="round-quotes">'+lastResult.finds.flatMap(f=>(f.quotes||[]).map(({quote,isNewQuote})=>'<div class="round-quote"><h3>'+escapeHtml(scholarById(f.id).nameZh)+'</h3>'+quoteHtml(quote,isNewQuote)+'</div>')).join('')+'</section>';
}
function collectBook(item) {
  const s=scholarById(item.scholarId),pick=chooseQuote(quotes,s.id,store.data.collection[s.id]);
  const isNew=store.discover(s.id,pick?.quote.id);
  toastText=(isNew?'發現新人物':'再次發現')+'：'+s.nameZh+' +50';toastUntil=game.elapsed+1.4;
  let find=gameFinds.find(f=>f.id===s.id);
  if(find)find.count++;else {find={id:s.id,isNew,count:1,quotes:[]};gameFinds.push(find);}
  if(pick){find.quotes.push(pick);document.querySelector('#discovery-note').innerHTML='<span class="eyebrow">'+escapeHtml(s.nameZh)+' · '+escapeHtml(pick.quote.topic)+' · '+(pick.isNewQuote?'發現新短句':'重溫一句話')+'</span><p>'+escapeHtml(pick.quote.text)+'</p><p class="quote-application"><span>教學／研究連結 · 編寫提示</span>'+escapeHtml(pick.quote.application)+'</p><small>'+(pick.quote.kind==='original'?'原文節錄':'原文節錄 · 繁中編譯')+' · 出處收錄於結算及收藏冊</small>';}
  warning();
}
function start() {
  enableAudio();lastResult=null;toastText='';toastUntil=0;
  game=new Game({portrait:window.matchMedia('(max-width:600px)').matches,scholars:scholars.map(s=>s.id),onCollect(item){sound(item.type);if(item.scholarId){collectBook(item);}else if(item.score<0){toastText=`${item.label} ${item.score} 分`;toastUntil=game.elapsed+1.4;}},onFinish(){finish();}});
  gameFinds=[];
  view(`<section class="game-board"><div class="game-top"><div class="hud"><div><label>本局分數</label><output id="score">0</output></div><div><label>回合</label><output id="round">1</output></div><div><label>剩餘時間</label><output id="time">60<span> 秒</span></output></div></div><div class="game-buttons"><button data-action="mute" id="mute">${store.data.mute?'音效：關':'音效：開'}</button><button data-action="pause">暫停 Ⅱ</button></div></div><div class="scene-frame"><canvas id="game-canvas" tabindex="0" aria-label="挖礦遊戲區，點擊或空白鍵出鉤"></canvas><div id="overlay" class="overlay"></div><div id="toast" class="toast" role="status" hidden></div></div><div class="discovery-note" id="discovery-note" role="status"><span class="eyebrow">每本藏書，帶回一句新發現。</span><p>重複遇見一位人物，也能發現不同的教學與研究觀點。</p></div><div class="game-help"><span>看準方向，點擊／空白鍵出鉤。<br>金銀礦依大小計分；廢鐵會扣分且很重。<br>藏書完整拉回後才會揭曉人物。</span><button class="fire-button" data-action="fire">出鉤 ↓</button></div></section>`, 'game');
  document.querySelector('#game-canvas').addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0){e.preventDefault();fire();}});
  document.querySelector('#game-canvas').focus({preventScroll:true});loop(performance.now());
}
let gameFinds=[];
function fire(){if(game?.fire())sound('fire');}
function pause(){if(screen!=='game'||!game)return;game.pause();stopSounds();lastTime=null;updateHud();}
function resume(){if(screen!=='game'||!game)return;enableAudio();game.resume();lastTime=null;updateHud();}
function nextRound(){if(screen!=='game'||!game||!game.nextRound())return;lastTime=null;updateHud();document.querySelector('#game-canvas').focus({preventScroll:true});}
function updateHud(){
  if(screen!=='game')return;
  document.querySelector('#score').textContent=game.score.toLocaleString();document.querySelector('#round').textContent=game.round;const timer=document.querySelector('#time');timer.textContent=`${Math.ceil(game.remaining)} 秒`;timer.classList.toggle('urgent',game.remaining<=10);
  const overlay=document.querySelector('#overlay'),phase=game.phase;
  const overlayKey=phase==='countdown'?`countdown:${Math.max(1,Math.ceil(game.countdown))}`:phase;
  if(overlay.dataset.state!==overlayKey){overlay.dataset.state=overlayKey;overlay.hidden=phase==='playing';overlay.innerHTML=phase==='paused'?`<div class="overlay-card"><span class="eyebrow">TAKE A LITTLE BREATH</span><h2>礦坑暫時休息</h2><p>時間與鉤子都留在原位。</p><button class="primary" data-action="resume">繼續挖礦 →</button><br><button data-action="leave" style="margin-top:12px">結束這次探險</button></div>`:phase==='countdown'?`<div class="overlay-card"><p>準備好，找準你的方向</p><div class="countdown-number">${Math.max(1,Math.ceil(game.countdown))}</div></div>`:phase==='roundComplete'?`<div class="overlay-card"><span class="eyebrow">ROUND ${game.round} COMPLETE</span><h2>這一輪的寶物都找到了！</h2><p>廢鐵可留在礦坑；下一輪會重新計時 60 秒，分數繼續累積。</p><button class="primary" data-action="nextRound">下一輪 →</button><br><button data-action="leave" style="margin-top:12px">結束探險並結算</button></div>`:'';}
  const toast=document.querySelector('#toast');toast.hidden=game.elapsed>=toastUntil;toast.textContent=toastText;
  document.querySelector('[data-action="fire"]').disabled=phase!=='playing'||game.hook.state!=='swing';
}
function loop(now){
  if(screen!=='game'||!game)return;
  const dt=lastTime===null?0:(now-lastTime)/1000;lastTime=now;
  game.update(dt);if(screen!=='game')return;
  drawScene(document.querySelector('#game-canvas'),game);updateHud();raf=requestAnimationFrame(loop);
}
function finish(completed=true){lastResult={score:game.score,record:completed?store.finish(game.score):false,completed,finds:gameFinds.map(f=>({...f}))};results();}
function results(){
  game=null;
  view(`<section class="result"><span class="eyebrow">EVERY DISCOVERY COUNTS</span><h1>今天，挖到一點新眼光。</h1><div class="result-score">${lastResult.score.toLocaleString()}</div><p class="result-note">${lastResult.record?'✦ 刷新本機最高分！':`本機最高分 ${store.data.bestScore.toLocaleString()}`}</p>${lastResult.finds.length?`<div class="section-title"><h2>這次遇見的思想家</h2><span>${lastResult.finds.length} 位人物</span></div><div class="collection-grid">${lastResult.finds.map(f=>card(scholarById(f.id),true)).join('')}</div>`:'<div class="empty-result">這次收穫了寶物，下次再找找思想藏書！</div>'}${roundQuotes()}<div class="actions"><button class="primary" data-action="start">再挖一局 →</button><button data-action="collection">查看收藏冊</button><button data-action="home">回首頁</button></div>${portal()}<p class="note">遊戲成績代表操作與取捨，不代表學術能力。</p></section>`, 'results');
  if(!lastResult.completed) document.querySelector('.result-note').textContent=`提前結束，本局不更新最高分。已發現的收藏仍保留。`;
}
app.addEventListener('click',e=>{
  const target=e.target.closest('button');if(!target)return;
  if(target.dataset.scholar){details(target.dataset.scholar);return;}
  ({start,home,collection,fire,pause,resume,nextRound,leave:()=>{if(game)finish(false);},retry:load,mute:()=>{store.toggleMute();stopSounds();enableAudio();target.textContent=store.data.mute?'音效：關':'音效：開';warning();}})[target.dataset.action]?.();
});
document.addEventListener('keydown',e=>{if(screen==='game'&&e.code==='Space'&&!e.repeat&&!e.target.closest('button,a,input,dialog')){e.preventDefault();fire();}if(screen==='game'&&e.code==='Escape'){pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);
window.addEventListener('resize',()=>{if(screen==='game'&&game){game.resize(window.matchMedia('(max-width:600px)').matches);lastTime=null;stopSounds();updateHud();}else if(screen==='home')home();});
window.addEventListener('pagehide',stopLoop);
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();if(screen==='game'){pause();return;}home();});
async function load(){
  await loadSceneAssets();
  try{const [response,quoteResponse]=await Promise.all([fetch('./data/scholars.json'),fetch('./data/quotes.json')]);if(!response.ok||!quoteResponse.ok)throw Error('Content unavailable');const [data,quoteData]=await Promise.all([response.json(),quoteResponse.json()]);scholars=data.scholars.filter(s=>s.enabled);quotes=quoteData.quotes;if(scholars.length<2||!Array.isArray(quotes))throw Error('Invalid content');home();}
  catch{view('<div class="loading"><p>思想藏書載入失敗，請確認本機伺服器仍在運作。</p><button data-action="retry">重新載入</button></div>','error');}
}
document.addEventListener('error',event=>{const image=event.target;if(image instanceof HTMLImageElement&&image.closest('.portrait')){image.parentElement.setAttribute('aria-label',image.parentElement.getAttribute('aria-label')+'，圖片載入失敗，顯示姓名卡');image.remove();}},true);
load();
