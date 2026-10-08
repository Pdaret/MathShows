import { test } from "node:test";
import assert from "node:assert/strict";
import { collectFrames } from "../src/lib/frames.ts";

test("collectFrames drains a generator and caps runaway ones", () => {
  function* count(n: number) { for (let i = 0; i < n; i++) yield i; }
  assert.deepEqual(collectFrames(count(3)), [0, 1, 2]);
  assert.equal(collectFrames(count(1e9), 50).length, 50);
});
