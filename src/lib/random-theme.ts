/** Stored hue is untrusted; accept only whole degrees in the CSS hue range. */
export function parseHue(value: string | null): number | null {
  if (value === null || !/^\d{1,3}$/.test(value)) return null;
  const hue = Number(value);
  return hue < 360 ? hue : null;
}

/** Pick a different hue on every click, without retry loops. */
export function randomHue(previous: number | null, random = Math.random()): number {
  return previous === null ? Math.floor(random * 360) : (previous + 1 + Math.floor(random * 359)) % 360;
}
