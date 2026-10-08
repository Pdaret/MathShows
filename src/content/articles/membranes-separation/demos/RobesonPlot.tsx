import { ROBESON_2008, upperBoundAlpha, type UpperBound } from "../../../../lib/membrane";
import { CanvasPlot } from "../../../../components/interactive/CanvasPlot";

const UB91: UpperBound = { k: 389224, n: -5.8 };
const line = (b: UpperBound) => Array.from({ length: 121 }, (_, i): [number, number] => {
  const P = 10 ** (-2 + i * 0.05);
  return [P, upperBoundAlpha(P, b)];
});
// Typical literature values (approximate, Baker 2012 / Robeson 2008)
const POLYMERS = [
  { x: 600, y: 2.1, label: "PDMS (سیلیکون)", align: "right" as const },
  { x: 1.4, y: 5.6, label: "پلی‌سولفون", dy: 16 },
  { x: 1.3, y: 6.6, label: "Matrimid", dy: -8 },
  { x: 0.8, y: 6.0, label: "استات سلولز", align: "right" as const, dy: 14 },
  { x: 33, y: 4.0, label: "پلی‌متیل‌پنتن", align: "right" as const },
];

/** Fig 17: Robeson O2/N2 upper bound (log–log). Theme-aware, otherwise static. */
export default function RobesonPlot() {
  return (
    <CanvasPlot height={330} label="نمودار رابسون O2/N2" spec={c => ({
      xmin: 0.1, xmax: 10000, xlog: true, ymin: 1, ymax: 30, ylog: true,
      xlabel: "تراوایی O₂ (Barrer)", ylabel: "انتخاب‌پذیری O₂/N₂",
      series: [{ pts: line(UB91), color: c.muted, dash: [5, 4], width: 1.5 }, { pts: line(ROBESON_2008.O2N2), color: c["accent-2"] }],
      points: POLYMERS.map(p => ({ ...p, color: c.accent })),
      legendX: 430,
      legend: [{ text: "حد بالای رابسون ۲۰۰۸", color: c["accent-2"] }, { text: "حد ۱۹۹۱", color: c.muted, dash: [5, 4] }],
    })} />
  );
}
