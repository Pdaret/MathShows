import assert from "node:assert/strict";
import { test } from "node:test";
import { det2, matVec2, type Mat2 } from "../src/lib/la.ts";

test("hero rotation/shear preserves area and every corner stays inside SVG", () => {
  for (let angle = -90; angle <= 90; angle++) {
    for (let step = -30; step <= 30; step++) {
      const r = angle * Math.PI / 180, shear = step * 0.05;
      const m: Mat2 = [[Math.cos(r) + shear * Math.sin(r), -Math.sin(r) + shear * Math.cos(r)], [Math.sin(r), Math.cos(r)]];
      assert(Math.abs(det2(m) - 1) < 1e-12);
      for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as [number, number][]) {
        const [x, y] = matVec2(m, p);
        assert(160 + x * 32 > 8 && 160 + x * 32 < 312);
        assert(110 - y * 32 > 8 && 110 - y * 32 < 212);
      }
    }
  }
});
