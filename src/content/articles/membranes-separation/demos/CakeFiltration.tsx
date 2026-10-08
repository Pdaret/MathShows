import { useState } from "preact/hooks";
import { LMH, cakeFlux } from "../../../../lib/membrane";
import { fa } from "../../../../components/interactive/hooks";
import { CanvasPlot } from "../../../../components/interactive/CanvasPlot";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

const Rm = 1e12, mu = 1e-3;

/** Fig 8: dead-end cake filtration flux vs time. */
export default function CakeFiltration() {
  const [dp, setDp] = useState(1);
  const [logK, setLogK] = useState(13);
  const K = 10 ** logK;
  const J = (t: number, p = dp, k = K) => cakeFlux(t * 60, p * 1e5, mu, Rm, k) / LMH;
  const range = Array.from({ length: 121 }, (_, t) => t);
  const J0 = J(0), tau = (mu * Rm * Rm) / (2 * K * dp * 1e5) / 60;
  return (
    <div>
      <CanvasPlot label="شار برحسب زمان" spec={c => ({
        xmin: 0, xmax: 120, ymin: 0, ymax: Math.max(400, Math.ceil(J0 / 100) * 100),
        xlabel: "زمان (دقیقه)", ylabel: "شار (LMH)",
        series: [
          { pts: range.map(t => [t, J(t, 1, 1e13)]), color: c.muted, dash: [5, 4], width: 1.5 },
          { pts: range.map(t => [t, J(t)]), color: c.accent },
        ],
        points: [{ x: 60, y: J(60), color: c["accent-2"], label: fa(J(60), 0) + " LMH" }],
      })} />
      <Controls>
        <Slider label="فشار ΔP" value={dp} min={0.2} max={4} step={0.1} unit="bar" onInput={setDp} />
        <Slider label="ضریب کیک K" value={logK} min={12} max={14} step={0.1} display={<span class="ltr">10^{logK.toFixed(1)}</span>} unit="m⁻²" onInput={setLogK} />
      </Controls>
      <Readout>
        شار اولیه {fa(J0, 0)} LMH · ثابت زمانی τ = {fa(tau, 1)} دقیقه · بعد از ۶۰ دقیقه {fa(J(60), 0)} LMH ({fa((100 * J(60)) / J0, 0)}٪ شار اولیه)
      </Readout>
    </div>
  );
}
