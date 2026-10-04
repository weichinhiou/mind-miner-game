import { CONFIG, equipmentLayout, sceneSize } from './config.js';
export function segmentHit(a, b, center, radius) {
  const dx = b.x - a.x, dy = b.y - a.y, fx = a.x - center.x, fy = a.y - center.y;
  const aa = dx * dx + dy * dy, cc = fx * fx + fy * fy - radius * radius;
  if (cc <= 0) return 0;
  if (!aa) return null;
  const bb = 2 * (fx * dx + fy * dy), discriminant = bb * bb - 4 * aa * cc;
  if (discriminant < 0) return null;
  const t = (-bb - Math.sqrt(discriminant)) / (2 * aa);
  return t >= 0 && t <= 1 ? t : null;
}
function shuffle(values, random) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function boardTypes() {
  return ['book', 'book', ...Object.entries(CONFIG.objects)
    .filter(([type]) => type !== 'book')
    .flatMap(([type, spec]) => Array(spec.count).fill(type))];
}
export function generateBoard(size, scholars, random = Math.random) {
  const origin = equipmentLayout(size).origin;
  const ids = shuffle(scholars, random);
  const types = boardTypes();
  const items = [];
  const valid = (p, r) => p.x >= r + 16 && p.x <= size.width - r - 16 && p.y >= 215 + r && p.y <= size.height - r - 24 && Math.abs(Math.atan2(p.x - origin.x, p.y - origin.y)) < CONFIG.swingAngle - .04 && items.every(q => Math.hypot(p.x - q.x, p.y - q.y) > r + q.radius + CONFIG.itemGap);
  for (const [i, type] of types.entries()) {
    const spec = CONFIG.objects[type]; let point;
    for (let attempt = 0; attempt < CONFIG.generationAttempts; attempt++) {
      const p = { x: 25 + random() * (size.width - 50), y: 240 + random() * ((i === 0 ? Math.min(size.height - 50, 340) : size.height - 50) - 240) };
      if (valid(p, spec.radius)) { point = p; break; }
    }
    if (!point) return fallbackBoard(size, ids);
    items.push({ id: i, type, ...point, ...spec, scholarId: type === 'book' ? ids[i] : null });
  }
  // First book has an unobstructed direct path from the origin.
  const book = items[0];
  if (items.some(q => q !== book && segmentHit(origin, book, q, q.radius + CONFIG.hookRadius) !== null)) return fallbackBoard(size, ids);
  return items;
}
function fallbackBoard(size, ids) {
  const portrait = size.width < size.height;
  const slots = portrait ? [[.35,.20],[.68,.33],[.22,.52],[.70,.65],[.47,.45],[.18,.78],[.85,.85],[.62,.86],[.44,.72],[.82,.48],[.14,.31],[.48,.93]] : [[.40,.20],[.70,.45],[.18,.64],[.80,.80],[.50,.64],[.30,.83],[.88,.35],[.12,.40],[.62,.73],[.33,.50],[.60,.28],[.48,.94]];
  const types = boardTypes();
  return slots.map(([x,y], i) => ({ id:i, type:types[i], x: x * size.width, y: 225 + y * (size.height - 280), ...CONFIG.objects[types[i]], scholarId: i < 2 ? ids[i] : null }));
}
export class Game {
  constructor({ portrait = false, scholars, random = Math.random, onCollect = () => {}, onFinish = () => {} }) {
    this.size = sceneSize(portrait); this.scholars = scholars; this.random = random; this.onCollect = onCollect; this.onFinish = onFinish;
    this.phase = 'countdown'; this.resumePhase = null; this.countdown = CONFIG.countdown; this.remaining = CONFIG.duration; this.score = 0; this.elapsed = 0; this.discoveries = []; this.hook = { state: 'swing', angle: 0, length: 30, caught: null }; this.items = generateBoard(this.size, scholars, random);
  }
  get origin() { return equipmentLayout(this.size).origin; }
  point(length = this.hook.length) { return { x: this.origin.x + Math.sin(this.hook.angle) * length, y: this.origin.y + Math.cos(this.hook.angle) * length }; }
  maxLength() {
    const dx = Math.sin(this.hook.angle), dy = Math.cos(this.hook.angle), o = this.origin;
    return Math.min((this.size.height - 14 - o.y) / dy, dx > 0 ? (this.size.width - 14 - o.x) / dx : dx < 0 ? (14 - o.x) / dx : Infinity);
  }
  fire() { if (this.phase !== 'playing' || this.hook.state !== 'swing') return false; this.hook.state = 'extending'; return true; }
  pause() { if (['countdown','playing'].includes(this.phase)) { this.resumePhase = this.phase; this.phase = 'paused'; } }
  resume() { if (this.phase === 'paused') { this.phase = this.resumePhase; this.resumePhase = null; } }
  resize(portrait) {
    this.pause(); const next = sceneSize(portrait), old = this.size;
    const oldOrigin = this.origin, nextOrigin = equipmentLayout(next).origin;
    const map = p => ({ x: p.x / old.width * next.width, y: nextOrigin.y + (p.y - oldOrigin.y) / (old.height - oldOrigin.y) * (next.height - nextOrigin.y) });
    const tip = map(this.point());
    this.items.forEach(p => Object.assign(p, map(p)));
    if (this.hook.caught) Object.assign(this.hook.caught, map(this.hook.caught));
    this.size = next;
    this.hook.angle = Math.atan2(tip.x - nextOrigin.x, tip.y - nextOrigin.y);
    this.hook.length = Math.hypot(tip.x - nextOrigin.x, tip.y - nextOrigin.y);
  }
  update(dt) {
    if (this.phase === 'paused' || this.phase === 'finished' || dt <= 0) return;
    if (this.phase === 'countdown') { this.countdown -= dt; if (this.countdown <= 0) this.phase = 'playing'; return; }
    this.remaining = Math.max(0, this.remaining - dt);
    if (this.remaining <= 0) { this.phase = 'finished'; this.onFinish(this); return; }
    this.elapsed += dt;
    const h = this.hook;
    if (h.state === 'swing') { h.angle = Math.sin(this.elapsed * Math.PI * 2 / CONFIG.swingPeriod) * CONFIG.swingAngle; h.length = 30; return; }
    if (h.state === 'extending') {
      const before = this.point(); const length = Math.min(this.maxLength(), h.length + CONFIG.shootSpeed * dt), after = this.point(length);
      let first = null, firstT = Infinity;
      for (const item of this.items) { const t = segmentHit(before, after, item, item.radius + CONFIG.hookRadius); if (t !== null && t < firstT) { first = item; firstT = t; } }
      h.length = length;
      if (first) { h.length = Math.hypot(before.x + (after.x - before.x) * firstT - this.origin.x, before.y + (after.y - before.y) * firstT - this.origin.y); h.caught = first; this.items = this.items.filter(item => item !== first); h.state = 'returning'; }
      else if (length >= this.maxLength()) h.state = 'empty';
    } else {
      h.length = Math.max(30, h.length - (h.caught ? CONFIG.loadedReturnSpeed / h.caught.weight : CONFIG.emptyReturnSpeed) * dt);
      if (h.length <= 30) {
        if (h.caught) { const item = h.caught; this.score += item.score; if (item.scholarId) this.discoveries.push(item.scholarId); h.caught = null; this.onCollect(item); }
        h.state = 'swing';
        if (!this.items.length) this.items = generateBoard(this.size, this.scholars, this.random);
      }
    }
  }
}
