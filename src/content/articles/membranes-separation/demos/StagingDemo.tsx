import { useState } from "preact/hooks";
import { solve } from "../../../../lib/la";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

const W = 480;

/** Fig 15: two-stage RO mass balance solved as A x = b. */
export default function StagingDemo() {
  const [qfIn, setQf] = useState(100);
  const [r1, setR1] = useState(50);
  const [r2, setR2] = useState(30);
  const qf = Math.max(0, qfIn || 0);
  const [qp1, qc1, qp2, qc2] = solve(
    [[1, 1, 0, 0], [1, 0, 0, 0], [0, -1, 1, 1], [0, -r2 / 100, 1, 0]],
    [qf, (r1 / 100) * qf, 0, 0],
  ) as [number, number, number, number];
  const segs = [[qp1, "--accent", "Q_p1"], [qp2, "--accent-3", "Q_p2"], [qc2, "--accent-2", "Q_c2"]] as const;
  let x = 20;
  return (
    <div>
      <Controls>
        <label class="ctl">Q_f <input type="number" value={qfIn} onInput={e => setQf(+(e.currentTarget as HTMLInputElement).value)} /></label>
        <Slider label="r₁" value={r1} min={10} max={60} unit="٪" onInput={setR1} />
        <Slider label="r₂" value={r2} min={0} max={60} unit="٪" onInput={setR2} />
      </Controls>
      <svg viewBox="0 0 520 90" width={520} style={{ marginTop: "0.8rem", marginInline: "auto" }}>
        {segs.map(([q, c, n]) => {
          const w = qf ? (q / qf) * W : 0, x0 = x;
          x += w;
          return (
            <g>
              <rect x={x0} y={20} width={w} height={34} style={`fill:var(${c})`} fill-opacity={0.7} />
              {w > 50 && <text x={x0 + w / 2} y={42} text-anchor="middle" font-size={12} class="math">{n} {q.toFixed(1)}</text>}
            </g>
          );
        })}
        <text x={20 + ((qp1 + qp2) / (qf || 1)) * (W / 2)} y={76} text-anchor="middle" font-size={12}>محصول</text>
      </svg>
      <Readout ltr>
        x = [{[qp1, qc1, qp2, qc2].map(v => v.toFixed(1)).join(", ")}] m³/h · overall recovery = {((100 * (qp1 + qp2)) / (qf || 1)).toFixed(1)}% (1 − (1−r₁)(1−r₂))
      </Readout>
    </div>
  );
}
