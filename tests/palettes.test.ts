import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const css = readFileSync(new URL("../src/styles/palettes.css", import.meta.url), "utf8");
function luminance(hex: string) {
  const rgb = hex.match(/[a-f0-9]{2}/gi)!.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test("all palette text, links and filled controls meet WCAG AA contrast", () => {
  const blocks = [...css.matchAll(/:root[^{}]*\{([^{}]+)\}/g)];
  assert.equal(blocks.length, 18);
  for (const block of blocks) {
    const c = Object.fromEntries([...block[1]!.matchAll(/--([\w-]+):\s*(#[a-f0-9]+);/gi)].map(m => [m[1], m[2]]));
    for (const background of ["bg", "surface", "surface-2"]) {
      for (const foreground of ["fg", "muted", "accent"]) {
        assert(contrast(c[foreground], c[background]) >= 4.5, `${block[0].split("{")[0]} ${foreground}/${background}`);
      }
    }
    assert(contrast(c["on-accent"], c.accent) >= 4.5);
  }
});
