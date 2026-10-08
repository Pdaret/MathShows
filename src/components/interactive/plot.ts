// Tiny canvas plotter: axes, grid, polylines, points, legend. Used by chart-style demos.
export interface Series { pts: [number, number][]; color: string; dash?: number[]; width?: number }
export interface Point { x: number; y: number; color: string; r?: number; label?: string; align?: "left" | "right"; dy?: number }
export interface LegendItem { text: string; color: string; dash?: number[] }
export interface PlotSpec {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xlog?: boolean; ylog?: boolean;
  xlabel: string; ylabel: string;
  series: Series[];
  points?: Point[];
  vlines?: { x: number; color: string; dash?: number[] }[];
  legend?: LegendItem[];
  legendX?: number;
  theme: { fg: string; muted: string; border: string; font: string };
}

export function plot(cv: HTMLCanvasElement, s: PlotSpec) {
  const ctx = cv.getContext("2d")!, W = cv.width, H = cv.height, L = 56, R = 28, T = 14, B = 42;
  const { fg, muted, border, font } = s.theme;
  ctx.direction = "ltr"; // canvas inherits page RTL; keep "22.8 LMH" in order
  const tx = (v: number) => (s.xlog ? Math.log10(v) : v), ty = (v: number) => (s.ylog ? Math.log10(v) : v);
  const X = (v: number) => L + ((tx(v) - tx(s.xmin)) / (tx(s.xmax) - tx(s.xmin))) * (W - L - R);
  const Y = (v: number) => H - B - ((ty(v) - ty(s.ymin)) / (ty(s.ymax) - ty(s.ymin))) * (H - T - B);
  ctx.clearRect(0, 0, W, H);
  ctx.font = "12px " + font;
  ctx.lineWidth = 1;
  const ticks = (lo: number, hi: number, log?: boolean) => {
    const a: number[] = [];
    if (log) { for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) a.push(10 ** e); return a; }
    const step = [1, 2, 5, 10, 20, 25, 50, 100].find(st => (hi - lo) / st <= 8) ?? (hi - lo) / 5;
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) a.push(+v.toFixed(6));
    return a;
  };
  ctx.strokeStyle = border; ctx.fillStyle = muted; ctx.textAlign = "center";
  for (const v of ticks(s.xmin, s.xmax, s.xlog)) { ctx.beginPath(); ctx.moveTo(X(v), T); ctx.lineTo(X(v), H - B); ctx.stroke(); ctx.fillText(String(v), X(v), H - B + 16); }
  ctx.textAlign = "right";
  for (const v of ticks(s.ymin, s.ymax, s.ylog)) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(W - R, Y(v)); ctx.stroke(); ctx.fillText(String(v), L - 6, Y(v) + 4); }
  ctx.strokeStyle = muted; ctx.strokeRect(L, T, W - L - R, H - T - B);
  ctx.textAlign = "center"; ctx.fillText(s.xlabel, (L + W - R) / 2, H - 6);
  ctx.save(); ctx.translate(14, (T + H - B) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(s.ylabel, 0, 0); ctx.restore();

  ctx.save(); ctx.beginPath(); ctx.rect(L, T, W - L - R, H - T - B); ctx.clip();
  for (const { x, color, dash } of s.vlines ?? []) {
    ctx.strokeStyle = color; ctx.setLineDash(dash ?? [5, 4]);
    ctx.beginPath(); ctx.moveTo(X(x), T); ctx.lineTo(X(x), H - B); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const se of s.series) {
    ctx.strokeStyle = se.color; ctx.lineWidth = se.width ?? 2.5; ctx.setLineDash(se.dash ?? []); ctx.beginPath();
    se.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const p of s.points ?? []) {
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r ?? 5, 0, 7); ctx.fill();
    if (p.label) {
      ctx.textAlign = p.align ?? "left"; ctx.fillStyle = fg;
      ctx.fillText(p.label, X(p.x) + (p.align === "right" ? -8 : 8), Y(p.y) + (p.dy ?? -6));
    }
  }
  ctx.restore();
  ctx.textAlign = "left";
  (s.legend ?? []).forEach(({ text, color, dash }, i) => {
    const y = T + 16 + i * 18, lx = s.legendX ?? L + 10;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash(dash ?? []);
    ctx.beginPath(); ctx.moveTo(lx, y - 4); ctx.lineTo(lx + 24, y - 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = fg; ctx.fillText(text, lx + 30, y);
  });
}
