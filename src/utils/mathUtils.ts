/**
 * Seeded xorshift128 PRNG for deterministic simulation.
 * Replaces Math.random() to ensure reproducible results.
 */
let s = [1234, 5678, 9012, 3456];

export function seedRandom(seed: number): void {
  s = [seed, seed ^ 0x6D2B79F5, seed ^ 0x1B56C4E9, seed ^ 0x2D1C8A3F];
}

export function randomFloat(): number {
  let t = s[3];
  const r = t ^ (t << 11);
  s[3] = s[2];
  s[2] = s[1];
  s[1] = s[0];
  const w = s[0];
  t = w ^ (w >>> 19) ^ (r ^ (r >>> 8));
  s[0] = t;
  return (t >>> 0) / 0xFFFFFFFF;
}
