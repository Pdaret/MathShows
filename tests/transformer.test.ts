import assert from "node:assert/strict";
import { test } from "node:test";
import { attention, patchLayout } from "../src/lib/transformer.ts";

const X = [[1, 0], [0, 1], [1, 1]];
const V = [[2, 0], [0, 4], [2, 4]];
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test("remaining worked arithmetic matches position, FFN, normalization and loss examples", () => {
  const pe = Array.from({ length: 4 }, (_, c) => c % 2 === 0 ? Math.sin(0) : Math.cos(0));
  assert.deepEqual(pe, [0, 1, 0, 1]);
  assert.deepEqual([1, 0, 1, 0].map((x, c) => x + pe[c]!), [1, 1, 1, 1]);
  const multiply = (row: number[], matrix: number[][]) => matrix[0]!.map((_, c) => row.reduce((s, x, i) => s + x * matrix[i]![c]!, 0));
  assert.deepEqual(multiply([1, 0, 0, 1], [[1, 0], [0, 1], [0, 1], [1, 0]]), [2, 0]);
  const hidden = multiply([1, -2], [[1, -1], [0, 1]]);
  assert.deepEqual(hidden, [1, -3]);
  assert.deepEqual(multiply(hidden.map(x => Math.max(0, x)), [[2, 0], [0, 1]]), [2, 0]);
  near((1 - 2) / Math.sqrt(1 + 1e-5), -0.999995);
  near((3 - 2) / Math.sqrt(1 + 1e-5), 0.999995);
  near(-Math.log(0.7), 0.356674944);
});

test("scaled attention reproduces the article's three-token example", () => {
  const { scores, weights, output } = attention(X, X, V);
  near(scores[1]![1]!, Math.SQRT1_2);
  near(weights[1]![0]!, 1 / (1 + 2 * Math.exp(Math.SQRT1_2)));
  weights.forEach(row => near(row.reduce((a, b) => a + b, 0), 1));
  near(output[1]![0]!, 2 * (weights[1]![0]! + weights[1]![2]!));
  near(output[1]![1]!, 4 * (weights[1]![1]! + weights[1]![2]!));
  assert.deepEqual(X, [[1, 0], [0, 1], [1, 1]]);
});

test("causal mask removes future tokens before normalizing", () => {
  const { scores, weights, output } = attention(X, X, V, true);
  assert.equal(scores[1]![2], -Infinity);
  assert.equal(weights[1]![2], 0);
  assert.deepEqual(weights[0], [1, 0, 0]);
  assert.deepEqual(output[0], V[0]);
  near(weights[1]![0]!, 1 / (1 + Math.exp(Math.SQRT1_2)));
  near(output[1]![0]!, 2 * weights[1]![0]!);
  near(output[1]![1]!, 4 * weights[1]![1]!);
});

test("softmax stays finite with large equal scores", () => {
  const { weights, output } = attention([[1000, 0]], [[1, 0], [1, 0]], [[2], [4]]);
  assert.deepEqual(weights, [[0.5, 0.5]]);
  assert.deepEqual(output, [[3]]);
});

test("patch dimensions reproduce ViT counts and quadratic score growth", () => {
  assert.deepEqual(patchLayout(224, 224, 16), { rows: 14, cols: 14, patches: 196, patchDim: 768, tokens: 197, scores: 38809 });
  const small = patchLayout(224, 224, 8);
  assert.equal(small.tokens, 785);
  assert.equal(small.scores, 616225);
  assert.equal(patchLayout(8, 8, 2, 1).patchDim, 4);
});

test("model rejects malformed matrices and patch geometry", () => {
  for (const [q, k, v] of [
    [[], X, V], [[[1], [2, 3]], X, V], [X, [[1]], V], [X, X, [[2]]],
    [[[NaN, 0]], X, V], [[[1e308, 0]], [[1e308, 0]], [[1]]],
  ]) assert.throws(() => attention(q!, k!, v!), /matrix|dimension|finite/i);
  assert.throws(() => attention([[1], [2]], [[1]], [[1]], true), /causal/i);
  for (const args of [[8, 8, 3], [0, 8, 2], [8, 8, 0], [8.5, 8, 2], [8, 8, 2, 0]]) {
    assert.throws(() => patchLayout(args[0]!, args[1]!, args[2]!, args[3]), /patch|integer/i);
  }
});
