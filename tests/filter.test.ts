import { test } from "node:test";
import assert from "node:assert/strict";
import { emptySel, matches, parseSel, serializeSel } from "../src/lib/filter.ts";

const it = { subjects: ["math", "cs"], formats: ["interactive"], level: "beginner", text: "جبر خطی Matrix" };

test("empty selection matches everything", () => assert.ok(matches(it, emptySel())));

test("OR inside a group, AND between groups", () => {
  assert.ok(matches(it, { ...emptySel(), subjects: ["physics", "cs"] }));
  assert.ok(!matches(it, { ...emptySel(), subjects: ["cs"], formats: ["animation"] }));
  assert.ok(!matches(it, { ...emptySel(), levels: ["advanced"] }));
});

test("text search is case-insensitive", () => {
  assert.ok(matches(it, { ...emptySel(), q: " matrix " }));
  assert.ok(!matches(it, { ...emptySel(), q: "svd" }));
});

test("url round-trip", () => {
  const s = { subjects: ["math", "cs"], formats: [], levels: ["beginner"], q: "جبر" };
  assert.deepEqual(parseSel(serializeSel(s)), s);
  assert.equal(serializeSel(emptySel()), "");
});
