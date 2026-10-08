import { useState } from "preact/hooks";
import { gasPermeate } from "../../../../lib/membrane";
import { fa } from "../../../../components/interactive/hooks";
import { CanvasPlot } from "../../../../components/interactive/CanvasPlot";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

/** Fig 16: permeate purity vs pressure ratio (log axis). */
export default function GasPermeationDemo() {
  const [a, setA] = useState(5);
  const [logPhi, setLogPhi] = useState(0.48);
  const [x, setX] = useState(0.21);
  const phi = 10 ** logPhi;
  const pts = Array.from({ length: 151 }, (_, i): [number, number] => [10 ** (i * 0.02), gasPermeate(x, a, 10 ** (i * 0.02))]);
  const yIdeal = (a * x) / (1 + (a - 1) * x), y = gasPermeate(x, a, phi);
  const regime = phi < a / 2 ? "محدود به نسبت فشار — بالا بردن انتخاب‌پذیری فایده‌ی کمی دارد"
    : phi > 2 * a ? "محدود به انتخاب‌پذیری غشا" : "ناحیه‌ی میانی — هر دو مهم‌اند";
  return (
    <div>
      <CanvasPlot label="خلوص تراوه برحسب نسبت فشار" spec={c => ({
        xmin: 1, xmax: 1000, xlog: true, ymin: 0, ymax: 1,
        xlabel: "نسبت فشار φ = p_feed / p_perm", ylabel: "کسر مولی در تراوه y",
        series: [
          { pts, color: c.accent },
          { pts: [[1, yIdeal], [1000, yIdeal]], color: c["accent-3"], dash: [5, 4], width: 1.5 },
          { pts: [[1, x], [1000, x]], color: c.muted, dash: [2, 4], width: 1.5 },
        ],
        points: [{ x: phi, y, color: c["accent-2"], label: "y = " + y.toFixed(3) }],
        legend: [
          { text: "خلوص تراوه", color: c.accent },
          { text: "سقف غشا (φ→∞)", color: c["accent-3"], dash: [5, 4] },
          { text: "ترکیب خوراک", color: c.muted, dash: [2, 4] },
        ],
      })} />
      <Controls>
        <Slider label="انتخاب‌پذیری α" value={a} min={1.5} max={50} step={0.5} onInput={setA} />
        <Slider label="نسبت فشار φ" value={logPhi} min={0} max={3} step={0.02} display={fa(phi, 1)} onInput={setLogPhi} />
        <Slider label="کسر مولی خوراک x" value={x} min={0.05} max={0.6} step={0.01} onInput={setX} />
      </Controls>
      <Readout>
        خلوص تراوه <b>{fa(100 * y, 1)}٪</b> (سقف ایده‌آل با <bdi>φ→∞</bdi>: {fa(100 * yIdeal, 1)}٪، سقف فشاری <bdi>φ·x</bdi>: {fa(Math.min(100, 100 * phi * x), 1)}٪) — {regime}
      </Readout>
    </div>
  );
}
