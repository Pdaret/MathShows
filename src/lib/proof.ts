// Educational tactic engine for propositional logic. It mimics the shape of Lean's goal state
// (hypotheses above ⊢ target); it is NOT Lean and checks nothing about real Lean code.

export type Prop =
  | { k: "atom"; n: string }
  | { k: "imp" | "and" | "or"; a: Prop; b: Prop };
export interface Hyp { name: string; p: Prop }
export interface Goal { hyps: Hyp[]; target: Prop }
export interface State { goals: Goal[]; next: number }
export interface Tactic { id: string; label: string; lean: string }

export const atom = (n: string): Prop => ({ k: "atom", n });
export const imp = (a: Prop, b: Prop): Prop => ({ k: "imp", a, b });
export const and = (a: Prop, b: Prop): Prop => ({ k: "and", a, b });
export const or = (a: Prop, b: Prop): Prop => ({ k: "or", a, b });

const SYM = { imp: "→", and: "∧", or: "∨" } as const;
export function show(p: Prop, top = true): string {
  if (p.k === "atom") return p.n;
  // Lean precedence: ∧ > ∨ > →, → is right-associative; always parenthesise nested for clarity.
  const s = `${show(p.a, false)} ${SYM[p.k]} ${show(p.b, p.k === "imp" && p.b.k === "imp")}`;
  return top ? s : `(${s})`;
}
export const same = (p: Prop, q: Prop): boolean => show(p) === show(q);

export const start = (target: Prop): State => ({ goals: [{ hyps: [], target }], next: 1 });
export const done = (s: State) => s.goals.length === 0;

/** Tactics legal on the first open goal. */
export function available(s: State): Tactic[] {
  const g = s.goals[0];
  if (!g) return [];
  const out: Tactic[] = [];
  const t = g.target;
  const h = `h${s.next}`, h2 = `h${s.next + 1}`;
  if (t.k === "imp") out.push({ id: "intro", label: "intro", lean: `intro ${h}` });
  if (t.k === "and") out.push({ id: "constructor", label: "constructor", lean: "constructor" });
  if (t.k === "or") {
    out.push({ id: "left", label: "left", lean: "left" }, { id: "right", label: "right", lean: "right" });
  }
  for (const x of g.hyps) {
    if (same(x.p, t)) out.push({ id: `exact ${x.name}`, label: `exact ${x.name}`, lean: `exact ${x.name}` });
    if (x.p.k === "and") out.push({ id: `cases ${x.name}`, label: `obtain ⟨·,·⟩ := ${x.name}`, lean: `obtain ⟨${h}, ${h2}⟩ := ${x.name}` });
    if (x.p.k === "or") out.push({ id: `cases ${x.name}`, label: `rcases ${x.name}`, lean: `rcases ${x.name} with ${h} | ${h2}` });
    if (x.p.k === "imp" && same(x.p.b, t)) out.push({ id: `apply ${x.name}`, label: `apply ${x.name}`, lean: `apply ${x.name}` });
  }
  return out;
}

/** Run a tactic by id on the first goal. Throws if it does not apply. */
export function run(s: State, id: string): { state: State; lean: string } {
  const tac = available(s).find(t => t.id === id);
  if (!tac) throw new RangeError(`Tactic "${id}" does not apply to the current goal`);
  const [g, ...rest] = s.goals as [Goal, ...Goal[]];
  const t = g.target, n = s.next;
  const h = `h${n}`, h2 = `h${n + 1}`;
  const mk = (goals: Goal[], used = 0): State => ({ goals: [...goals, ...rest], next: n + used });
  const [op, arg] = id.split(" ");
  if (op === "exact") return { state: mk([]), lean: tac.lean };
  if (op === "intro" && t.k === "imp") return { state: mk([{ hyps: [...g.hyps, { name: h, p: t.a }], target: t.b }], 1), lean: tac.lean };
  if (op === "constructor" && t.k === "and") return { state: mk([{ hyps: g.hyps, target: t.a }, { hyps: g.hyps, target: t.b }]), lean: tac.lean };
  if ((op === "left" || op === "right") && t.k === "or") return { state: mk([{ hyps: g.hyps, target: op === "left" ? t.a : t.b }]), lean: tac.lean };
  const src = g.hyps.find(x => x.name === arg);
  if (op === "apply" && src?.p.k === "imp") return { state: mk([{ hyps: g.hyps, target: src.p.a }]), lean: tac.lean };
  if (op === "cases" && src) {
    const others = g.hyps.filter(x => x !== src);
    if (src.p.k === "and") return { state: mk([{ hyps: [...others, { name: h, p: src.p.a }, { name: h2, p: src.p.b }], target: t }], 2), lean: tac.lean };
    if (src.p.k === "or") return {
      state: mk([{ hyps: [...others, { name: h, p: src.p.a }], target: t }, { hyps: [...others, { name: h2, p: src.p.b }], target: t }], 2),
      lean: tac.lean,
    };
  }
  throw new RangeError(`Tactic "${id}" is not implemented for this goal`);
}

const P = atom("P"), Q = atom("Q"), R = atom("R");
export interface Theorem { id: string; name: string; target: Prop; atoms: string; solution: string[] }
export const THEOREMS: Theorem[] = [
  { id: "const", name: "imp_const", atoms: "P Q", target: imp(P, imp(Q, P)), solution: ["intro", "intro", "exact h1"] },
  { id: "and", name: "and_swap", atoms: "P Q", target: imp(and(P, Q), and(Q, P)), solution: ["intro", "cases h1", "constructor", "exact h3", "exact h2"] },
  { id: "or", name: "or_swap", atoms: "P Q", target: imp(or(P, Q), or(Q, P)), solution: ["intro", "cases h1", "right", "exact h2", "left", "exact h3"] },
  { id: "trans", name: "imp_trans", atoms: "P Q R", target: imp(imp(P, Q), imp(imp(Q, R), imp(P, R))), solution: ["intro", "intro", "intro", "apply h2", "apply h1", "exact h3"] },
];

/** Replay a solution; returns the state after each step (index 0 = initial). */
export function replay(t: Theorem): { state: State; lean: string }[] {
  const frames = [{ state: start(t.target), lean: "" }];
  for (const id of t.solution) frames.push(run(frames.at(-1)!.state, id));
  return frames;
}

/** Induction on n for `0 + n = n`: frame k says which facts have been established. */
export function* dominoes(n: number) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 20) throw new RangeError("n must be an integer in [0, 20]");
  for (let k = 0; k <= n; k++) {
    yield { k, via: k === 0 ? "base" as const : "step" as const };
  }
}
