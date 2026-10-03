import { CONFIG } from './config.js';
export function createStore(storage) {
  const key = `${CONFIG.gameId}:save`;
  let available = true;
  let data = { schemaVersion: CONFIG.schemaVersion, bestScore: 0, mute: false, collection: {} };
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== CONFIG.schemaVersion || !Number.isFinite(parsed.bestScore) || parsed.bestScore < 0 || typeof parsed.mute !== 'boolean' || !parsed.collection || typeof parsed.collection !== 'object' || Array.isArray(parsed.collection)) throw Error('Unsupported save');
      for (const item of Object.values(parsed.collection)) {
        if (!item || !Number.isInteger(item.count) || item.count < 1 || typeof item.firstUnlockedAt !== 'string') throw Error('Invalid collection');
        item.quoteIds = [...new Set(Array.isArray(item.quoteIds) ? item.quoteIds.filter(id => typeof id === 'string') : [])];
        if (typeof item.lastQuoteId !== 'string') delete item.lastQuoteId;
      }
      data = parsed;
    }
  } catch { available = false; }
  function save() {
    // Unknown/corrupt versions are preserved, never silently replaced.
    if (!available) return false;
    try { storage.setItem(key, JSON.stringify(data)); return true; } catch { available = false; return false; }
  }
  return {
    get data() { return data; }, get available() { return available; },
    discover(id, quoteId = null) {
      const isNew = !Object.hasOwn(data.collection, id);
      if (isNew) Object.defineProperty(data.collection, id, { value: { firstUnlockedAt: new Date().toISOString(), count: 1 }, enumerable: true, writable: true, configurable: true });
      else data.collection[id].count++;
      const entry = data.collection[id];
      entry.quoteIds ??= [];
      if (quoteId) { if (!entry.quoteIds.includes(quoteId)) entry.quoteIds.push(quoteId); entry.lastQuoteId = quoteId; }
      save(); return isNew;
    },
    finish(score) { const record = score > data.bestScore; data.bestScore = Math.max(score, data.bestScore); save(); return record; },
    toggleMute() { data.mute = !data.mute; save(); },
  };
}
