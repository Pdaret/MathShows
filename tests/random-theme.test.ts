import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHue, randomHue } from "../src/lib/random-theme.ts";

test("stored hues reject malformed values and CSS payloads", () => {
  for (const value of [null, "", "-1", "360", "1.5", "Infinity", "10; color:red", " 1"]) assert.equal(parseHue(value), null);
  for (let hue = 0; hue < 360; hue++) assert.equal(parseHue(String(hue)), hue);
});
test("random hue always changes and stays inside range", () => {
  for (let hue = 0; hue < 360; hue++) {
    for (const random of [0, 0.5, 0.999999]) {
      const next = randomHue(hue, random);
      assert(next >= 0 && next < 360 && Number.isInteger(next));
      assert.notEqual(next, hue);
    }
  }
  assert.equal(randomHue(null, 0), 0);
  assert.equal(randomHue(null, 0.999999), 359);
});
