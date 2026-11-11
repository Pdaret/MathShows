import assert from "node:assert/strict";
import { test } from "node:test";
import { THEOREMS, atom, available, and, dominoes, done, imp, replay, run, show, start } from "../src/lib/proof.ts";

test("every bundled theorem solution replays to a closed proof", () => {
  for (const t of THEOREMS) {
    const frames = replay(t);
    assert.equal(frames.length, t.solution.length + 1, t.name);
    assert.ok(done(frames.at(-1)!.state), `${t.name} not closed`);
    assert.ok(frames.slice(0, -1).every(f => !done(f.state)), `${t.name} closes early`);
  }
});

test("goal state after intro / cases matches the article's listing", () => {
  const t = THEOREMS.find(x => x.id === "and")!;
  const f = replay(t);
  assert.equal(show(f[0]!.state.goals[0]!.target), "(P ∧ Q) → Q ∧ P".replace("Q ∧ P", "(Q ∧ P)"));
  assert.deepEqual(f[2]!.state.goals[0]!.hyps.map(h => `${h.name}:${show(h.p)}`), ["h2:P", "h3:Q"]);
  assert.equal(f[3]!.state.goals.length, 2);
  assert.equal(show(f[3]!.state.goals[1]!.target), "P");
});

test("tactics that do not apply are rejected", () => {
  const s = start(imp(atom("P"), atom("Q")));
  assert.throws(() => run(s, "constructor"), /does not apply/);
  assert.throws(() => run(s, "exact h1"), /does not apply/);
  assert.deepEqual(available(start(and(atom("P"), atom("Q")))).map(t => t.id), ["constructor"]);
});

test("dominoes cover base case then n steps", () => {
  const f = [...dominoes(3)];
  assert.deepEqual(f.map(x => x.via), ["base", "step", "step", "step"]);
  assert.throws(() => [...dominoes(-1)], /integer/);
  assert.throws(() => [...dominoes(21)], /integer/);
});
