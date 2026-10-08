import { useEffect, useRef, useState } from "preact/hooks";
import { det2, matVec2, type Mat2 } from "../../../../lib/la";
import { useCssVars } from "../../../../components/interactive/hooks";
import { Controls, Readout } from "../../../../components/interactive/controls";

const PRESETS: Record<string, Mat2> = {
  "همانی": [[1, 0], [0, 1]], "مقیاس": [[2, 0], [0, 0.5]], "دوران ۹۰°": [[0, -1], [1, 0]],
  "برش": [[1, 1], [0, 1]], "قرینه": [[-1, 0], [0, 1]], "تکین (det=0)": [[1, 2], [0.5, 1]],
};
const ID: Mat2 = [[1, 0], [0, 1]];

/** Fig 4: 2x2 linear transform, animated from the current matrix to the target. */
export default function TransformDemo() {
  const cv = useRef<HTMLCanvasElement>(null);
  const cur = useRef<Mat2>(ID);
  const [M, setM] = useState<Mat2>([[1, 1], [0, 1]]);
  const [input, setInput] = useState<Mat2>(M);
  const c = useCssVars(["border", "accent", "accent-2", "accent-3", "accent-4"] as const);

  useEffect(() => {
    const ctx = cv.current!.getContext("2d")!, W = 360, H = 360, S = 36;
    const px = ([x, y]: [number, number]): [number, number] => [W / 2 + x * S, H / 2 - y * S];
    const grid = (A: Mat2, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) for (const [p, q] of [[[i, -8], [i, 8]], [[-8, i], [8, i]]] as const) {
        ctx.beginPath(); ctx.moveTo(...px(matVec2(A, [...p]))); ctx.lineTo(...px(matVec2(A, [...q]))); ctx.stroke();
      }
    };
    const arrow = (A: Mat2, v: [number, number], color: string) => {
      const [x, y] = px(matVec2(A, v)), [ox, oy] = px([0, 0]), a = Math.atan2(y - oy, x - ox);
      ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x - 10 * Math.cos(a - 0.4), y - 10 * Math.sin(a - 0.4));
      ctx.lineTo(x - 10 * Math.cos(a + 0.4), y - 10 * Math.sin(a + 0.4)); ctx.fill();
    };
    const draw = (A: Mat2) => {
      ctx.clearRect(0, 0, W, H);
      grid(ID, c.border);
      ctx.globalAlpha = 0.45; grid(A, c["accent-4"]); ctx.globalAlpha = 0.3;
      ctx.fillStyle = c.accent; ctx.beginPath();
      ([[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]).forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](...px(matVec2(A, p))));
      ctx.fill(); ctx.globalAlpha = 1;
      arrow(A, [1, 0], c["accent-2"]); arrow(A, [0, 1], c["accent-3"]);
    };
    const from = cur.current.map(r => [...r]) as Mat2, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 700), e = t * t * (3 - 2 * t);
      cur.current = from.map((r, i) => r.map((v, j) => v + (M[i]![j]! - v) * e)) as Mat2;
      draw(cur.current);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [M, c]);

  const set = (i: 0 | 1, j: 0 | 1) => (e: Event) => {
    const next = input.map(r => [...r]) as Mat2;
    next[i][j] = +(e.currentTarget as HTMLInputElement).value;
    setInput(next);
  };
  const d = det2(M);
  return (
    <div>
      <canvas ref={cv} width={360} height={360} aria-label="نمایش تبدیل خطی" />
      <Controls>
        {(["a", "b", "c", "d"] as const).map((n, k) => {
          const i = (k >> 1) as 0 | 1, j = (k & 1) as 0 | 1;
          return <label class="ctl">{n} <input type="number" step={0.1} value={input[i][j]} onInput={set(i, j)} /></label>;
        })}
        <button type="button" onClick={() => setM(input)}>اعمال</button>
      </Controls>
      <Controls>
        {Object.entries(PRESETS).map(([name, P]) =>
          <button type="button" class="secondary" onClick={() => { setInput(P); setM(P); }}>{name}</button>)}
      </Controls>
      <Readout ltr>
        A = [[{M[0].join(", ")}], [{M[1].join(", ")}]] &nbsp; det = {d.toFixed(2)}
        {Math.abs(d) < 1e-9 && "  (singular: plane collapses to a line)"}
      </Readout>
    </div>
  );
}
