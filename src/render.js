import { CONFIG } from './config.js';
function ellipse(ctx, x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); }
function polygon(ctx, points, fill, stroke) { ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if (stroke) {ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();} }
export function drawCat(ctx, x, y, scale=1) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  ctx.strokeStyle='#313838'; ctx.lineWidth=13; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(26,28); ctx.bezierCurveTo(65,36,70,0,52,-8);ctx.stroke();
  ellipse(ctx,0,20,27,32,'#313838');
  polygon(ctx,[[-28,-11],[-25,-44],[-6,-26],[13,-27],[29,-44],[30,-9]],'#313838');
  ellipse(ctx,0,-9,32,25,'#313838');
  polygon(ctx,[[-23,-31],[-22,-19],[-12,-23]],'#bb9080');polygon(ctx,[[24,-31],[22,-19],[13,-23]],'#bb9080');
  ellipse(ctx,-12,-10,7,5,'#d5d791');ellipse(ctx,12,-10,7,5,'#d5d791');
  ellipse(ctx,-11,-10,1.8,5,'#242a2a');ellipse(ctx,11,-10,1.8,5,'#242a2a');
  polygon(ctx,[[-3,-1],[3,-1],[0,3]],'#d5a598');
  ctx.strokeStyle='#c6c2aa';ctx.lineWidth=1;for(const side of [-1,1])for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(side*12,2+i*3);ctx.lineTo(side*38,-3+i*9);ctx.stroke();}
  ellipse(ctx,-16,44,12,6,'#252c2c');ellipse(ctx,16,44,12,6,'#252c2c');
  ctx.fillStyle='#c59b4d';ctx.fillRect(-24,15,48,7);
  ctx.restore();
}
export function drawItem(ctx, item, x=item.x, y=item.y) {
  const r=item.radius;ctx.save();ctx.translate(x,y);
  ellipse(ctx,2,r*.75,r*.9,6,'#7a573621');
  if(item.type==='book') {
    ctx.rotate(-.13);ctx.fillStyle='#fcf2d9';ctx.fillRect(-r+4,-r+4,r*2-3,r*2-1);
    ctx.fillStyle='#716994';ctx.fillRect(-r,-r,r*2-3,r*2);ctx.fillStyle='#514c70';ctx.fillRect(-r,-r,6,r*2);
    ctx.strokeStyle='#e7d4a0';ctx.lineWidth=1.5;ctx.strokeRect(-r+9,-r+6,r*2-19,r*2-12);
    ctx.fillStyle='#efe1b2';ctx.font='18px Georgia';ctx.textAlign='center';ctx.fillText('✦',3,7);
  } else if(item.type==='gem') {
    polygon(ctx,[[-r,-r*.35],[-r*.5,-r],[r*.5,-r],[r,-r*.35],[0,r]],'#8cb8b5','#507f82');
    polygon(ctx,[[-r,-r*.35],[0,-r*.6],[0,r]],'#b7dbd0');polygon(ctx,[[0,-r*.6],[r*.5,-r],[r,-r*.35],[0,r]],'#659b9e');
  } else {
    const gold=item.type!=='rock';
    polygon(ctx,[[-r,-r*.35],[-r*.7,-r*.85],[r*.15,-r],[r*.82,-r*.48],[r,r*.32],[r*.25,r*.78],[-r*.65,r*.6]],gold?'#ddb556':'#969487',gold?'#ba8b38':'#787c72');
    polygon(ctx,[[-r*.7,-r*.85],[r*.15,-r],[r*.2,-r*.3],[-r*.6,r*.1]],gold?'#f5d887':'#b5b3a2');
    polygon(ctx,[[r*.2,-r*.3],[r*.82,-r*.48],[r,r*.32],[r*.25,r*.78]],gold?'#c6973c':'#7e8278');
    if(gold){ctx.fillStyle='#fff4cb';ctx.font='17px serif';ctx.fillText('✧',-r*.45,-r*.05);}
  }
  ctx.restore();
}
export function drawScene(canvas, game, preview=false) {
  const ctx=canvas.getContext('2d'), {width:w,height:h}=game.size;
  const dpr=Math.min(window.devicePixelRatio||1,2), rect=canvas.getBoundingClientRect();
  const pixelW=Math.round(rect.width*dpr),pixelH=Math.round(rect.height*dpr);
  if(canvas.width!==pixelW||canvas.height!==pixelH){canvas.width=pixelW;canvas.height=pixelH;}
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  const sky=ctx.createLinearGradient(0,0,0,205);sky.addColorStop(0,'#f8f1dc');sky.addColorStop(1,'#ebe1bd');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ellipse(ctx,w*.79,56,32,32,'#f2dc9d77');
  polygon(ctx,[[0,168],[w*.13,92],[w*.29,174],[w*.47,128],[w*.65,173],[w*.85,111],[w,173],[w,230],[0,230]],'#c6c8ab66');
  polygon(ctx,[[0,194],[w*.15,151],[w*.32,192],[w*.58,163],[w*.78,182],[w,140],[w,230],[0,230]],'#a7ad9570');
  const dirt=ctx.createLinearGradient(0,195,0,h);dirt.addColorStop(0,'#dfc597');dirt.addColorStop(.5,'#cbb184');dirt.addColorStop(1,'#b49671');ctx.fillStyle=dirt;ctx.fillRect(0,198,w,h-198);
  // Deterministic original soil marks: no random flicker or external art dependency.
  for(let i=0;i<150;i++){const x=(Math.sin(i*41.3)*.5+.5)*w,y=213+(Math.cos(i*11.9)*.5+.5)*(h-224);ellipse(ctx,x,y,2+(i%6),1+(i%3),'#8d71451a');}
  ctx.strokeStyle='#b29968';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,200);for(let x=0;x<=w;x+=20)ctx.lineTo(x,199+Math.sin(x*.05)*3);ctx.stroke();
  ctx.fillStyle='#8b9273';for(let x=8;x<w;x+=43){ctx.fillRect(x,187+Math.sin(x)*3,2,12);}
  ctx.fillStyle='#766146';ctx.fillRect(w/2-80,166,160,13);ctx.fillRect(w/2-61,179,10,25);ctx.fillRect(w/2+51,179,10,25);
  drawCat(ctx,w/2-32,119,.83);
  ellipse(ctx,w/2+25,124,22,22,'#8b7557');ellipse(ctx,w/2+25,124,14,14,'#d4ba8e');ellipse(ctx,w/2+25,124,5,5,'#766146');
  for(const item of game.items)drawItem(ctx,item);
  const tip=game.point();ctx.strokeStyle='#776248';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(game.origin.x,game.origin.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
  if(game.hook.caught)drawItem(ctx,game.hook.caught,tip.x,tip.y+game.hook.caught.radius*.4);
  ctx.save();ctx.translate(tip.x,tip.y);ctx.rotate(-game.hook.angle);ctx.strokeStyle='#454f4c';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-8,9);ctx.quadraticCurveTo(0,19,8,9);ctx.lineTo(10,0);ctx.stroke();ctx.restore();
  if(preview){ctx.fillStyle='#f8eed633';ctx.fillRect(0,0,w,h);}
}
