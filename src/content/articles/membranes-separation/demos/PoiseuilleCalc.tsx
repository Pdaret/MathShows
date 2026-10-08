import { useState } from "preact/hooks";
import { LMH, hpFlux } from "../../../../lib/membrane";
import { fa } from "../../../../components/interactive/hooks";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

/** Fig 7: Hagen–Poiseuille pure-water flux calculator (τ = 2, water at 20 °C). */
export default function PoiseuilleCalc() {
  const [r, setR] = useState(10);
  const [eps, setEps] = useState(0.3);
  const [L, setL] = useState(1);
  const [dp, setDp] = useState(1);
  const J = hpFlux(eps, r * 1e-9, dp * 1e5, 1e-3, 2, L * 1e-6) / LMH;
  return (
    <div>
      <Controls>
        <Slider label="شعاع منفذ r" value={r} min={1} max={100} unit="nm" onInput={setR} />
        <Slider label="تخلخل ε" value={eps} min={0.05} max={0.7} step={0.05} onInput={setEps} />
        <Slider label="ضخامت L" value={L} min={0.1} max={10} step={0.1} unit="µm" onInput={setL} />
        <Slider label="فشار ΔP" value={dp} min={0.1} max={5} step={0.1} unit="bar" onInput={setDp} />
      </Controls>
      <Readout>
        شار آب ≈ <b>{fa(J, 0)}</b> LMH (لیتر بر متر مربع بر ساعت) — یک غشای ۱۰۰۰ مترمربعی در ساعت {fa(J, 0)} مترمکعب آب می‌دهد.
      </Readout>
    </div>
  );
}
