// Run: node tests/la.test.js
const assert = require("assert");
const LA = require("../assets/js/la.js");

assert.strictEqual(LA.dot([3, 2], [1, 3]), 9);
assert.strictEqual(LA.norm([3, 4]), 5);
assert.deepStrictEqual(LA.matVec2([[0, -1], [1, 0]], [1, 0]), [0, 1]);
assert.strictEqual(LA.det2([[2, 1], [1, 2]]), 3);

// Worked example from the article: vertical edge 10 | 200, 5x5 patch, valid Laplacian.
const row = [10, 10, 10, 200, 200];
const img = Float32Array.from([].concat(row, row, row, row, row));
const out = LA.convolve2d(img, 5, 5, LA.KERNELS.laplace4, "valid");
assert.deepStrictEqual([out.w, out.h], [3, 3]);
assert.deepStrictEqual(Array.from(out.data.slice(0, 3)), [0, 190, -190]);

// Linear ramp: Laplacian is zero inside (second derivative of a line).
const ramp = Float32Array.from({ length: 25 }, (_, i) => (i % 5) * 7);
assert.ok(LA.convolve2d(ramp, 5, 5, LA.KERNELS.laplace4, "valid").data.every(v => v === 0));

// 200x200 with replicate padding keeps size.
const big = LA.convolve2d(new Float32Array(200 * 200), 200, 200, LA.KERNELS.laplace4);
assert.deepStrictEqual([big.w, big.h], [200, 200]);

// Two-stage RO mass balance from the membranes article.
const q = LA.solve([[1, 1, 0, 0], [1, 0, 0, 0], [0, -1, 1, 1], [0, -0.3, 1, 0]], [100, 50, 0, 0]);
assert.deepStrictEqual(q.map(v => +v.toFixed(9)), [50, 50, 15, 35]);
assert.throws(() => LA.solve([[1, 2], [2, 4]], [1, 2]), /singular/);

console.log("la.js: all checks passed");
