export const CONFIG = Object.freeze({
  gameId: 'thought-miner', schemaVersion: 1, duration: 60, countdown: 3,
  swingAngle: 70 * Math.PI / 180, swingPeriod: 3,
  shootSpeed: 600, emptyReturnSpeed: 700, loadedReturnSpeed: 420,
  hookRadius: 7, itemGap: 12, generationAttempts: 120,
  portalUrl: null, personaLensUrl: null,
  objects: {
    smallGold: { score: 20, weight: 1.2, radius: 19, count: 4, label: '小金塊' },
    largeGold: { score: 80, weight: 3, radius: 32, count: 2, label: '大金塊' },
    gem: { score: 100, weight: 1, radius: 14, count: 1, label: '寶石' },
    rock: { score: 5, weight: 4, radius: 27, count: 3, label: '石頭' },
    book: { score: 50, weight: 1.8, radius: 22, count: 2, label: '學者藏書' },
  },
});
export function sceneSize(portrait) { return portrait ? { width: 480, height: 720 } : { width: 960, height: 540 }; }
