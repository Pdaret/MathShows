import { useState } from "preact/hooks";
import { osmotic, roSolve } from "../../../../lib/membrane";
import { fa } from "../../../../components/interactive/hooks";
import { CanvasPlot } from "../../../../components/interactive/CanvasPlot";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

const B = 0.05;

/** Fig 12: RO water flux vs applied pressure, with optional concentration polarization. */
export default function ReverseOsmosisDemo() {
  const [dP, setDP] = useState(60);
  const [Cf, setCf] = useState(35);
  const [A, setA] = useState(1);
  const [cp, setCp] = useState(false);
  const [kk, setK] = useState(100);
  const k = cp ? kk : Infinity;
  const curve = (kv: number) => Array.from({ length: 161 }, (_, i): [number, number] => [i / 2, roSolve({ dP: i / 2, A, B, Cf, k: kv }).Jw]);
  const r = roSolve({ dP, A, B, Cf, k });
  const pi = osmotic(Cf, 58.44);
  return (
    <div>
      <CanvasPlot label="شار آب برحسب فشار" spec={c => ({
        xmin: 0, xmax: 80, ymin: 0, ymax: Math.max(10, Math.ceil((A * (80 - pi)) / 10) * 10 + 10),
        xlabel: "فشار اعمالی ΔP (bar)", ylabel: "شار آب Jw (LMH)",
        series: [{ pts: curve(Infinity), color: c.accent, dash: cp ? [5, 4] : [] }, ...(cp ? [{ pts: curve(k), color: c["accent-2"] }] : [])],
        vlines: [{ x: pi, color: c["accent-3"] }],
        legend: [
          { text: "بدون قطبش غلظت", color: c.accent, dash: cp ? [5, 4] : [] },
          ...(cp ? [{ text: "با قطبش غلظت", color: c["accent-2"] }] : []),
          { text: "π خوراک", color: c["accent-3"], dash: [5, 4] },
        ],
        points: [{ x: dP, y: r.Jw, color: c.fg, label: fa(r.Jw, 1) + " LMH" }],
      })} />
      <Controls>
        <Slider label="فشار ΔP" value={dP} min={0} max={80} unit="bar" onInput={setDP} />
        <Slider label="شوری خوراک" value={Cf} min={1} max={70} unit="g/L" onInput={setCf} />
        <Slider label="تراوایی آب A" value={A} min={0.5} max={5} step={0.1} unit="LMH/bar" onInput={setA} />
        <label class="ctl"><input type="checkbox" checked={cp} onChange={e => setCp((e.currentTarget as HTMLInputElement).checked)} /> قطبش غلظت</label>
        {cp && <Slider label="k" value={kk} min={20} max={300} step={5} unit="LMH" onInput={setK} />}
      </Controls>
      <Readout>
        فشار اسمزی خوراک π = <b>{fa(pi, 1)}</b> bar · شار آب <b>{fa(r.Jw, 1)}</b> LMH · غلظت تراوه {fa(r.Cp * 1000, 0)} mg/L ·
        پس‌زنی نمک <b>{fa(100 * r.R, 2)}٪</b>
        {cp && <> · غلظت روی سطح غشا {fa(r.Cm, 1)} g/L (ضریب قطبش {fa(r.Cm / Cf, 2)})</>}
      </Readout>
    </div>
  );
}
