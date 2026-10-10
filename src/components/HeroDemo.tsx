import { useEffect, useRef, useState } from "preact/hooks";
import { det2, matVec2, type Mat2 } from "../lib/la";
import { useCssVars } from "./interactive/hooks";
import { Slider } from "./interactive/controls";

const W = 320, H = 320, S = 34;

/** Home-page hero: drag two sliders, watch the plane and the matrix change. Idles with a gentle sweep until touched. */
export default function HeroDemo() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(25);
  const [shear, setShear] = useState(0.6);
  const [touched, setTouched] = useState(false);
  const c = useCssVars(["border", "accent", "accent-2", "accent-3", "accent-4"] as const);

  // Idle sweep: skipped for reduced-motion users and stops at first interaction.
  useEffect(() => {
    if (touched || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = (t: number) => { setAngle(Math.round(40 * Math.sin(t / 1400))); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touched]);

  const r = (angle * Math.PI) / 180;
  const M: Mat2 = [
    [Math.cos(r) + shear * Math.sin(r), -Math.sin(r) + shear * Math.cos(r)],
    [Math.sin(r), Math.cos(r)],
  ];

  useEffect(() => {
    const ctx = cv.current!.getContext("2d")!;
    const px = ([x, y]: [number, number]): [number, number] => [W / 2 + x * S, H / 2 - y * S];
    const line = (A: Mat2, p: [number, number], q: [number, number]) => {
      ctx.beginPath(); ctx.moveTo(...px(matVec2(A, p))); ctx.lineTo(...px(matVec2(A, q))); ctx.stroke();
    };
    const I: Mat2 = [[1, 0], [0, 1]];
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.strokeStyle = c.border;
    for (let i = -5; i <= 5; i++) { line(I, [i, -5], [i, 5]); line(I, [-5, i], [5, i]); }
    ctx.strokeStyle = c["accent-4"]; ctx.globalAlpha = 0.5;
    for (let i = -5; i <= 5; i++) { line(M, [i, -5], [i, 5]); line(M, [-5, i], [5, i]); }
    ctx.globalAlpha = 0.3; ctx.fillStyle = c.accent; ctx.beginPath();
    ([[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]).forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](...px(matVec2(M, p))));
    ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 3;
    ctx.strokeStyle = c["accent-2"]; line(M, [0, 0], [1, 0]);
    ctx.strokeStyle = c["accent-3"]; line(M, [0, 0], [0, 1]);
  }, [M[0][0], M[0][1], M[1][0], M[1][1], c]);

  const f = (n: number) => n.toFixed(2);
  return (
    <div class="hero-demo">
      <canvas ref={cv} width={W} height={H} role="img" aria-label="شبکه‌ی صفحه که با ماتریس تغییر شکل می‌دهد" />
      <p class="readout ltr" aria-live="off">
        A = [[{f(M[0][0])}, {f(M[0][1])}], [{f(M[1][0])}, {f(M[1][1])}]] &nbsp; det = {f(det2(M))}
      </p>
      <div class="controls">
        <Slider label="دوران" value={angle} min={-90} max={90} unit="°" onInput={v => { setTouched(true); setAngle(v); }} />
        <Slider label="برش" value={shear} min={-1.5} max={1.5} step={0.05} display={f(shear)} onInput={v => { setTouched(true); setShear(v); }} />
      </div>
    </div>
  );
}
