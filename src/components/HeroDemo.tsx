import { useEffect, useRef, useState } from "preact/hooks";
import { det2, matVec2, type Mat2 } from "../lib/la";
import { Slider } from "./interactive/controls";


/** Compare rotation/shear with an optional, explicitly started animation. */
export default function HeroDemo() {
  const [angle, setAngle] = useState(25);
  const [shear, setShear] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  const demo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || document.hidden) { setPlaying(false); return; }
    let frame = 0, last = 0, elapsed = 0;
    const startAngle = angle;
    const stop = () => setPlaying(false);
    const tick = (time: number) => {
      if (last) elapsed += Math.min(time - last, 50);
      last = time;
      setAngle(Math.round(90 * Math.sin(Math.asin(startAngle / 90) + elapsed / 2500)));
      frame = requestAnimationFrame(tick);
    };
    const onVisibility = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry?.isIntersecting) stop(); });
    observer.observe(demo.current!);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", stop);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", stop);
    };
  }, [playing]);

  const r = (angle * Math.PI) / 180;
  const M: Mat2 = [
    [Math.cos(r) + shear * Math.sin(r), -Math.sin(r) + shear * Math.cos(r)],
    [Math.sin(r), Math.cos(r)],
  ];

  const square: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const transformed = square.map(p => matVec2(M, p));
  // Fixed scale fits all allowed angles/shears without hiding size changes by zooming.
  const points = (ps: [number, number][]) => ps.map(([x, y]) => `${160 + x * 32},${110 - y * 32}`).join(" ");
  const f = (n: number) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2);
  return (
    <div class="hero-demo" ref={demo}>
      <svg class="hero-comparison" viewBox="0 0 320 220" role="img" aria-label={`مربع اولیه با خط‌چین و شکل پس از دوران ${angle} درجه و برش ${shear}؛ مساحت ثابت است`}>
        <path d="M16 110H304M160 18V202" stroke="var(--border)" fill="none" />
        <text x="294" y="102" class="math" font-size="12">x</text>
        <text x="170" y="23" class="math" font-size="12">y</text>
        <polygon points={points(square)} fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" />
        <polygon class="transformed-square" points={points(transformed)} fill="var(--accent)" fill-opacity="0.16" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" />
        {transformed.map(([x, y], i) => <circle key={i} cx={160 + x * 32} cy={110 - y * 32} r="3" fill="var(--accent)" />)}
        <circle cx="160" cy="110" r="2.5" fill="var(--fg)" />
      </svg>
      <div class="demo-legend"><span>خط‌چین: مربع اولیه</span><span>رنگی: بعد از تغییر</span></div>
      <div class="controls">
        <Slider label="دوران" value={angle} min={-90} max={90} unit="°" onInput={v => { setPlaying(false); setAngle(v); }} />
        <Slider label="برش" value={shear} min={-1.5} max={1.5} step={0.05} display={f(shear)} onInput={v => { setPlaying(false); setShear(v); }} />
      </div>
      <p class="readout">شکل عوض می‌شود؛ مساحت <span class="num">{f(det2(M))}</span> برابر می‌ماند.</p>
      <details class="demo-matrix"><summary>ماتریس این تبدیل</summary><p class="readout ltr">A = [[{f(M[0][0])}, {f(M[0][1])}], [{f(M[1][0])}, {f(M[1][1])}]]</p></details>
      <div class="demo-actions">
        <button type="button" class="secondary demo-play" aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? "توقف حرکت" : "پخش حرکت"}</button>
        <button type="button" class="secondary demo-reset" onClick={() => { setPlaying(false); setAngle(0); setShear(0); }}>بازگشت به مربع اولیه</button>
      </div>
      <p class="motion-note">با تنظیم «کاهش حرکت» دستگاه، پخش غیرفعال است؛ لغزنده‌ها همچنان کار می‌کنند.</p>
    </div>
  );
}
