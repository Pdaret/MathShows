import { useState } from "preact/hooks";
import { osmotic } from "../../../../lib/membrane";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

const X = (r: number) => 50 + r * 560, Y = (p: number) => 240 - (p / 120) * 220;

/** Fig 13: minimum pump pressure π_c = π_f/(1−r) vs recovery. */
export default function RecoveryLimitDemo() {
  const [cf, setCf] = useState(35);
  const [rp, setRp] = useState(45);
  const [dP, setDP] = useState(65);
  const r = rp / 100, pf = osmotic(cf, 58.44), pc = pf / (1 - r), ok = dP > pc;
  const curve: string[] = [];
  for (let v = 0; v <= 0.8; v += 0.01) { const p = pf / (1 - v); if (p <= 120) curve.push(`${X(v)},${Y(p)}`); }
  return (
    <div>
      <svg viewBox="0 0 520 280" width={520}>
        <line x1={50} x2={510} y1={240} y2={240} class="axis" />
        <line x1={50} x2={50} y1={15} y2={240} class="axis" />
        {[0, 20, 40, 60, 80, 100, 120].map(p => <text x={44} y={Y(p) + 4} text-anchor="end" font-size={11} class="math">{p}</text>)}
        {[0, 0.2, 0.4, 0.6, 0.8].map(v => <text x={X(v)} y={256} text-anchor="middle" font-size={11} class="math">{v * 100}%</text>)}
        <polygon points={`${X(0)},${Y(120)} ${curve.join(" ")} ${X(0.8)},${Y(120)}`} style="fill:var(--accent-2)" fill-opacity={0.08} />
        <polyline points={curve.join(" ")} fill="none" stroke-width={2.5} style="stroke:var(--accent-2)" />
        <line x1={50} x2={510} y1={Y(dP)} y2={Y(dP)} stroke-width={2} stroke-dasharray="6 4" style="stroke:var(--accent)" />
        <circle cx={X(r)} cy={Y(Math.min(dP, 120))} r={7} style={`fill:var(${ok ? "--accent-3" : "--accent-2"})`} />
        <text x={500} y={30} text-anchor="end" font-size={12}>فشار (bar) بر حسب بازیافت</text>
        <text x={X(0.62)} y={Y(110)} text-anchor="middle" font-size={12} style="fill:var(--accent-2)">ناحیه‌ی ناممکن</text>
      </svg>
      <Controls>
        <Slider label="شوری خوراک" value={cf} min={1} max={45} unit="g/L" onInput={setCf} />
        <Slider label="بازیافت r" value={rp} min={5} max={80} unit="٪" onInput={setRp} />
        <Slider label="فشار پمپ ΔP" value={dP} min={5} max={85} unit="bar" onInput={setDP} />
      </Controls>
      <Readout ltr>
        π_f = {pf.toFixed(1)} bar, π_c = {pc.toFixed(1)} bar, ΔP = {dP} bar →{" "}
        {ok ? `OK, mean net pressure ≈ ${(dP - (pf + pc) / 2).toFixed(1)} bar` : "infeasible: ΔP < π_c, no flux at module outlet"}
      </Readout>
    </div>
  );
}
