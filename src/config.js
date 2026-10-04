export const CONFIG = Object.freeze({
  gameId: 'thought-miner', schemaVersion: 1, duration: 60, countdown: 3,
  swingAngle: 70 * Math.PI / 180, swingPeriod: 3,
  shootSpeed: 600, emptyReturnSpeed: 700, loadedReturnSpeed: 420,
  hookRadius: 7, itemGap: 12, generationAttempts: 120,
  portalUrl: null, personaLensUrl: null,
  objects: {
    smallGold: { score: 20, weight: 1.2, radius: 18, count: 2, label: '小金礦' },
    mediumGold: { score: 45, weight: 2.1, radius: 24, count: 1, label: '中金礦' },
    largeGold: { score: 80, weight: 3, radius: 31, count: 1, label: '大金礦' },
    smallSilver: { score: 15, weight: 1.3, radius: 18, count: 2, label: '小銀礦' },
    mediumSilver: { score: 30, weight: 2.2, radius: 24, count: 2, label: '中銀礦' },
    largeSilver: { score: 60, weight: 3.2, radius: 30, count: 1, label: '大銀礦' },
    gem: { score: 100, weight: 1, radius: 14, count: 1, label: '寶石' },
    book: { score: 50, weight: 1.8, radius: 22, count: 2, label: '學者藏書' },
  },
});
export function sceneSize(portrait) { return portrait ? { width: 480, height: 720 } : { width: 960, height: 540 }; }
