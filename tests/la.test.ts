// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { KERNELS, convolve2d, det2, dot, matVec2, norm, solve } from "../src/lib/la.ts";

test("vector basics", () => {
  assert.equal(dot([3, 2], [1, 3]), 9);
  assert.equal(norm([3, 4]), 5);
  assert.deepEqual(matVec2([[0, -1], [1, 0]], [1, 0]), [0, 1]);
  assert.equal(det2([[2, 1], [1, 2]]), 3);
});

test("laplacian worked example: vertical edge 10 | 200", () => {
  const row = [10, 10, 10, 200, 200];
  const out = convolve2d(Float32Array.from([...row, ...row, ...row, ...row, ...row]), 5, 5, KERNELS.laplace4, "valid");
  assert.deepEqual([out.w, out.h], [3, 3]);
  assert.deepEqual(Array.from(out.data.slice(0, 3)), [0, 190, -190]);
});

test("laplacian of a linear ramp is zero", () => {
  const ramp = Float32Array.from({ length: 25 }, (_, i) => (i % 5) * 7);
  assert.ok(convolve2d(ramp, 5, 5, KERNELS.laplace4, "valid").data.every(v => v === 0));
});

test("replicate padding keeps 200x200", () => {
  const big = convolve2d(new Float32Array(200 * 200), 200, 200, KERNELS.laplace4);
  assert.deepEqual([big.w, big.h], [200, 200]);
});

test("two-stage RO mass balance (membranes article)", () => {
  const q = solve([[1, 1, 0, 0], [1, 0, 0, 0], [0, -1, 1, 1], [0, -0.3, 1, 0]], [100, 50, 0, 0]);
  assert.deepEqual(q.map(v => +v.toFixed(9)), [50, 50, 15, 35]);
  assert.throws(() => solve([[1, 2], [2, 4]], [1, 2]), /singular/);
});
