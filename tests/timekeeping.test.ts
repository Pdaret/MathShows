import assert from "node:assert/strict";
import { test } from "node:test";
import { ntpExchange } from "../src/lib/timekeeping.ts";

test("four timestamps recover offset with symmetric paths, expose asymmetric bias", () => {
  assert.deepEqual(ntpExchange(1000, 1140, 1150, 1090), { offset: 100, delay: 80 });
  assert.deepEqual(ntpExchange(1000, 1120, 1130, 1090), { offset: 80, delay: 80 });
  assert.deepEqual(ntpExchange(1000, 1020, 1030, 1090), { offset: -20, delay: 80 });
});
