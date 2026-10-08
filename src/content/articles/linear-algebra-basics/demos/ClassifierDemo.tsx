import { useState } from "preact/hooks";
import { dot } from "../../../../lib/la";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

// Deterministic pseudo-random points (LCG) so the figure is stable between reloads.
const pts = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const out: { x: [number, number]; c: 1 | -1 }[] = [];
  for (let i = 0; i < 25; i++) out.push({ x: [-1.3 + gauss() * 0.6, -1 + gauss() * 0.6], c: -1 });
  for (let i = 0; i < 25; i++) out.push({ x: [1.2 + gauss() * 0.6, 1.1 + gauss() * 0.6], c: 1 });
  return out;
})();
const S = 50, P = ([x, y]: [number, number]): [number, number] => [160 + x * S, 160 - y * S];

/** Fig 12: linear classifier w·x + b with draggable angle and bias. */
export default function ClassifierDemo() {
  const [theta, setTheta] = useState(100);
  const [bias, setBias] = useState(10);
  const th = (theta * Math.PI) / 180, b = bias / 10;
  const w: [number, number] = [Math.cos(th), Math.sin(th)];
  const p0: [number, number] = [-b * w[0], -b * w[1]], dir = [-w[1], w[0]] as const;
  const at = (t: number, s = 0) => P([p0[0] + dir[0] * t + w[0] * s, p0[1] + dir[1] * t + w[1] * s]);
  const tip = P([p0[0] + w[0], p0[1] + w[1]]);
  let wrong = 0;
  const marks = pts.map(p => {
    const bad = (dot(w, p.x) + b > 0 ? 1 : -1) !== p.c;
    wrong += +bad;
    const [cx, cy] = P(p.x);
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} style={`fill:var(${p.c > 0 ? "--accent-2" : "--accent"})`} />
        {bad && <circle cx={cx} cy={cy} r={9} fill="none" style="stroke:var(--fg)" stroke-width={1.5} />}
      </g>
    );
  });
  return (
    <div>
      <svg viewBox="0 0 320 320" width={320}>
        <rect width={320} height={320} fill="url(#grid40)" />
        <polygon points={[[-10, 0], [10, 0], [10, 30], [-10, 30]].map(([t, s]) => at(t!, s).join(",")).join(" ")} style="fill:var(--accent-2)" fill-opacity={0.12} />
        <line x1={at(-10)[0]} y1={at(-10)[1]} x2={at(10)[0]} y2={at(10)[1]} style="stroke:var(--fg)" stroke-width={2} />
        <line x1={P(p0)[0]} y1={P(p0)[1]} x2={tip[0]} y2={tip[1]} stroke-width={3} style="stroke:var(--accent-4)" marker-end="url(#ah-4)" />
        <text x={tip[0] + 6} y={tip[1] - 6} font-weight={700} style="fill:var(--accent-4)">w</text>
        {marks}
      </svg>
      <Controls>
        <Slider label="زاویه‌ی w" value={theta} min={0} max={359} onInput={setTheta} unit="°" />
        <Slider label="بایاس b" value={bias} min={-30} max={30} onInput={setBias} display={b.toFixed(1)} />
      </Controls>
      <Readout ltr>w = ({w[0].toFixed(2)}, {w[1].toFixed(2)}), b = {b.toFixed(1)} · errors: {wrong}/{pts.length}</Readout>
    </div>
  );
}
