import { useMemo, useState } from "preact/hooks";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";
import { useInterval } from "../../../../components/interactive/hooks";
import { Stepper } from "../../../../components/interactive/Stepper";
import { THEOREMS, available, dominoes, done, replay, run, show, start, type Goal, type State } from "../../../../lib/proof";

const goalText = (g: Goal) => [...g.hyps.map(h => `${h.name} : ${show(h.p)}`), `⊢ ${show(g.target)}`].join("\n");
const stateText = (s: State) => done(s)
  ? "No goals"
  : s.goals.map((g, i) => (s.goals.length > 1 ? `case ${i + 1}\n` : "") + goalText(g)).join("\n\n");

/** Candidate tactic ids for the buttons: all of them are shown, inapplicable ones fail like in Lean. */
function candidates(s: State): { id: string; label: string }[] {
  const g = s.goals[0];
  const base = ["intro", "constructor", "left", "right"].map(id => ({ id, label: id }));
  if (!g) return base;
  const perHyp = g.hyps.flatMap(h => [
    { id: `exact ${h.name}`, label: `exact ${h.name}` },
    { id: `apply ${h.name}`, label: `apply ${h.name}` },
    ...(h.p.k === "imp" ? [] : [{ id: `cases ${h.name}`, label: `cases ${h.name}` }]),
  ]);
  return [...base, ...perHyp];
}

/** Interactive tactic game: pick a theorem, click tactics, watch the goal state change. */
export function TacticDemo() {
  const [tid, setTid] = useState(THEOREMS[0]!.id);
  const thm = THEOREMS.find(t => t.id === tid)!;
  const [hist, setHist] = useState<{ state: State; lean: string }[]>(() => [{ state: start(thm.target), lean: "" }]);
  const [msg, setMsg] = useState("");
  const [auto, setAuto] = useState(false);
  const cur = hist.at(-1)!.state;
  const ok = new Set(available(cur).map(t => t.id));
  const reset = (id = tid) => {
    const t = THEOREMS.find(x => x.id === id)!;
    setHist([{ state: start(t.target), lean: "" }]); setMsg(""); setAuto(false);
  };
  const pick = (id: string) => {
    try { setHist([...hist, run(cur, id)]); setMsg(""); }
    catch { setMsg(`خطا: تاکتیک ${id} روی هدف اول اجرا نمی‌شود؛ در Lean هم همین‌جا قرمز می‌شد و پیشرفتی ثبت نمی‌شد.`); }
  };
  const solution = useMemo(() => replay(thm), [thm]);
  useInterval(() => {
    if (hist.length >= solution.length) { setAuto(false); return; }
    setHist(solution.slice(0, hist.length + 1)); setMsg("");
  }, auto ? 900 : null);
  const script = hist.slice(1).map(h => "  " + h.lean).join("\n");
  const header = `theorem ${thm.name} (${thm.atoms} : Prop) :\n    ${show(thm.target)} := by`;
  return <div>
    <Controls>
      <label class="ctl"><span class="ctl-label">قضیه</span>
        <select value={tid} onChange={e => { setTid(e.currentTarget.value); reset(e.currentTarget.value); }}>
          {THEOREMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <button type="button" class="secondary" onClick={() => reset()}>از اول</button>
      <button type="button" class="secondary" disabled={hist.length < 2} onClick={() => { setHist(hist.slice(0, -1)); setMsg(""); }}>یک قدم عقب</button>
      <button type="button" onClick={() => { if (done(cur)) reset(); setAuto(!auto); }}>{auto ? "توقف" : "نمایش اثبات کامل"}</button>
    </Controls>
    <div class="controls" role="group" aria-label="تاکتیک‌ها">
      {candidates(cur).map(c => <button key={c.id} type="button" class={ok.has(c.id) ? "" : "secondary"} disabled={done(cur)} onClick={() => pick(c.id)}>{c.label}</button>)}
    </div>
    <pre class="ltr" aria-label="وضعیت اثبات"><code>{`${header}\n${script}${done(cur) ? "\n  -- no goals: QED" : ""}\n\n${stateText(cur)}`}</code></pre>
    <Readout>{done(cur)
      ? "اثبات کامل شد؛ kernel هیچ هدف بازی نمی‌بیند."
      : msg || `${cur.goals.length} هدف باز. دکمه‌های کم‌رنگ فعلاً روی هدف اول کاربرد ندارند؛ بزن و خطا را ببین.`}</Readout>
    <p class="readout">این یک شبیه‌ساز آموزشی برای منطق گزاره‌هاست و Lean واقعی اجرا نمی‌کند؛ ولی متن اسکریپتی که می‌سازد همان است که در لینک «اجرا در Lean» می‌توانی بازش کنی.</p>
  </div>;
}

/** Induction as falling dominoes: base case tips the first one, the inductive step passes it on. */
export function DominoDemo() {
  const [n, setN] = useState(6);
  const W = 520, gap = (W - 60) / Math.max(1, n);
  return <div>
    <Controls><Slider label="n" min={1} max={12} value={n} onInput={setN} /></Controls>
    <Stepper
      algorithm={() => dominoes(n)}
      deps={[n]}
      speed={700}
      render={f => <svg viewBox="0 0 540 170" width="540" role="img" aria-label={`دومینوها تا شمارهٔ ${f.k} افتاده‌اند`}>
        <path d="M20 140H520" stroke="var(--border)" stroke-width="2" />
        {Array.from({ length: n + 1 }, (_, i) => {
          const x = 30 + i * gap, fallen = i <= f.k;
          return <g key={i} transform={fallen ? `rotate(62 ${x} 140)` : ""}>
            <rect x={x - 6} y="80" width="12" height="60" rx="2" fill={fallen ? "var(--accent)" : "var(--surface-2)"} stroke="var(--accent)" stroke-width="2" />
          </g>;
        })}
        <g text-anchor="middle" font-size="13">
          {Array.from({ length: n + 1 }, (_, i) => <text key={i} x={30 + i * gap} y="162" class="math">{i}</text>)}
        </g>
        <text x="270" y="30" text-anchor="middle" font-size="15">{f.via === "base" ? "پایه: zero ⇒ P 0 (با rfl)" : `گام: ih ⇒ P ${f.k}`}</text>
      </svg>}
      describe={f => f.via === "base"
        ? "case zero : 0 + 0 = 0  -- rfl"
        : `case succ ${f.k - 1} : از ih : 0 + ${f.k - 1} = ${f.k - 1} نتیجه می‌شود 0 + ${f.k} = ${f.k}`}
    />
    <p class="readout">اثبات استقرا فقط دو چیز می‌گوید: دومینوی صفر می‌افتد و افتادن k دومینوی k+1 را می‌اندازد. n را هرچه بزرگ کنی، همین دو مورد کافی‌اند.</p>
  </div>;
}
