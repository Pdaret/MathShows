import type { ComponentChildren } from "preact";
import { useMemo, useState } from "preact/hooks";
import { collectFrames, type Algorithm } from "../../lib/frames";
import { useInterval } from "./hooks";

interface StepperProps<F> {
  /** Generator function yielding one snapshot per step. Re-run when `deps` change. */
  algorithm: Algorithm<F>;
  /** Render one frame. */
  render: (frame: F, index: number) => ComponentChildren;
  /** Optional caption for the current frame (equation, explanation…). */
  describe?: (frame: F, index: number) => ComponentChildren;
  deps?: unknown[];
  /** Initial ms per step. */
  speed?: number;
}

const SPEEDS = [1400, 700, 300, 100];

/**
 * Generic play / pause / step / scrub UI for any algorithm expressed as a generator.
 * New algorithm = one generator + one render function; no player code.
 */
export function Stepper<F>({ algorithm, render, describe, deps = [], speed = 700 }: StepperProps<F>) {
  const frames = useMemo(() => collectFrames(algorithm()), deps);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ms, setMs] = useState(speed);
  const last = frames.length - 1;
  const k = Math.min(i, last);

  useInterval(() => {
    if (k >= last) setPlaying(false);
    else setI(k + 1);
  }, playing ? ms : null);

  if (!frames.length) return null;
  const frame = frames[k]!;
  const go = (n: number) => { setPlaying(false); setI(Math.max(0, Math.min(last, n))); };

  return (
    <div class="stepper">
      <div class="stepper-stage">{render(frame, k)}</div>
      {describe && <p class="readout ltr" aria-live="polite">{describe(frame, k)}</p>}
      <div class="controls">
        <button type="button" onClick={() => go(0)} aria-label="از اول" class="secondary">⏮</button>
        <button type="button" onClick={() => go(k - 1)} aria-label="قدم قبل" class="secondary" disabled={k === 0}>◀</button>
        <button type="button" onClick={() => { if (k >= last) setI(0); setPlaying(!playing); }}>
          {playing ? "توقف" : "پخش"}
        </button>
        <button type="button" onClick={() => go(k + 1)} aria-label="قدم بعد" class="secondary" disabled={k === last}>▶</button>
        <label class="ctl">
          <span class="ctl-label">قدم</span>
          <input type="range" min={0} max={last} value={k} onInput={e => go(+(e.currentTarget as HTMLInputElement).value)} />
          <output class="num">{k + 1}/{frames.length}</output>
        </label>
        <label class="ctl">
          <span class="ctl-label">سرعت</span>
          <select value={ms} onChange={e => setMs(+(e.currentTarget as HTMLSelectElement).value)}>
            {SPEEDS.map((s, n) => <option value={s}>{"×" + 2 ** n / 2}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
