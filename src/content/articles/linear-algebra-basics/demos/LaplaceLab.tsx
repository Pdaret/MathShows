import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { KERNELS, convolve2d } from "../../../../lib/la";
import { fa, useCssVars } from "../../../../components/interactive/hooks";
import { Controls, Readout, Slider } from "../../../../components/interactive/controls";

const W = 200, H = 200;

function synthetic() {
  const a = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 40 + x * 0.5;                                                    // linear ramp
    if (x >= 25 && x < 95 && y >= 30 && y < 110) v = 220;                    // rectangle
    if (Math.hypot(x - 145, y - 65) < 32) v = 15;                            // dark disc
    v += 150 * Math.exp(-((x - 120) ** 2 + (y - 155) ** 2) / (2 * 18 ** 2)); // soft blob
    a[y * W + x] = Math.min(255, v);
  }
  return a;
}

function put(cv: HTMLCanvasElement | null, data: ArrayLike<number>, map: (v: number) => number) {
  if (!cv) return;
  const ctx = cv.getContext("2d")!, im = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = Math.max(0, Math.min(255, map(data[i]!)));
    im.data[4 * i] = im.data[4 * i + 1] = im.data[4 * i + 2] = v; im.data[4 * i + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
}

/** Fig 10: Laplacian on a 200x200 image with noise, LoG and row profile. */
export default function LaplaceLab() {
  const [base, setBase] = useState(synthetic);
  const [kernel, setKernel] = useState<"laplace4" | "laplace8">("laplace4");
  const [noise, setNoise] = useState(0);
  const [smooth, setSmooth] = useState(false);
  const [row, setRow] = useState(100);
  const refs = { src: useRef<HTMLCanvasElement>(null), signed: useRef<HTMLCanvasElement>(null), abs: useRef<HTMLCanvasElement>(null), sharp: useRef<HTMLCanvasElement>(null) };
  const c = useCssVars(["accent", "accent-2"] as const);

  const { src, lap, lo, hi, zeros } = useMemo(() => {
    let src: Float32Array = base.map(v => v + (noise ? (Math.random() * 2 - 1) * noise * 1.7 : 0));
    if (smooth) for (let k = 0; k < 2; k++) src = convolve2d(src, W, H, KERNELS.gauss3).data;
    const lap = convolve2d(src, W, H, KERNELS[kernel]).data;
    let lo = Infinity, hi = -Infinity, zeros = 0;
    for (const v of lap) { if (v < lo) lo = v; if (v > hi) hi = v; if (Math.abs(v) < 1e-3) zeros++; }
    return { src, lap, lo, hi, zeros };
  }, [base, kernel, noise, smooth]);

  useEffect(() => {
    const m = Math.max(-lo, hi) || 1;
    const sq = (v: number) => Math.sign(v) * Math.sqrt(Math.abs(v) / m); // sqrt scale keeps weak responses visible
    put(refs.src.current, src, v => v);
    put(refs.signed.current, lap, v => 128 + sq(v) * 127);
    put(refs.abs.current, lap, v => Math.abs(sq(v)) * 255);
    put(refs.sharp.current, src.map((v, i) => v - lap[i]!), v => v);
    const ctx = refs.src.current!.getContext("2d")!;
    ctx.fillStyle = c["accent-2"]; ctx.fillRect(0, row, W, 1);
  }, [src, lap, row, c]);

  const m = Math.max(1, ...Array.from({ length: W }, (_, x) => Math.abs(lap[row * W + x]!)));
  const X = (x: number) => 10 + x * 2.5;
  const line = (f: (x: number) => number) => Array.from({ length: W }, (_, x) => `${X(x)},${f(x)}`).join(" ");

  const onFile = (e: Event) => {
    const f = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!f) return;
    const im = new Image();
    im.onload = () => {
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const x = cv.getContext("2d")!, s = Math.min(im.width, im.height);
      x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, W, H); // centre-crop, resize
      const d = x.getImageData(0, 0, W, H).data;
      setBase(Float32Array.from({ length: W * H }, (_, i) => 0.299 * d[4 * i]! + 0.587 * d[4 * i + 1]! + 0.114 * d[4 * i + 2]!));
      URL.revokeObjectURL(im.src);
    };
    im.src = URL.createObjectURL(f);
  };

  const panel = (ref: { current: HTMLCanvasElement | null }, label: preact.ComponentChildren) =>
    <div><canvas ref={ref} class="pixel" width={W} height={H} />{label}</div>;

  return (
    <div>
      <div class="panels grid-2">
        {panel(refs.src, "ورودی ۲۰۰×۲۰۰")}
        {panel(refs.signed, "لاپلاس (خاکستری = ۰؛ مقیاس جذری)")}
        {panel(refs.abs, "|لاپلاس| — نقشه‌ی لبه")}
        {panel(refs.sharp, "تیزشده: I − ∇²I")}
      </div>
      <Controls>
        <label class="ctl">کرنل
          <select value={kernel} onChange={e => setKernel((e.currentTarget as HTMLSelectElement).value as typeof kernel)}>
            <option value="laplace4">K4 (۴-همسایگی)</option>
            <option value="laplace8">K8 (۸-همسایگی)</option>
          </select>
        </label>
        <Slider label="نویز" value={noise} min={0} max={40} onInput={setNoise} />
        <label class="ctl"><input type="checkbox" checked={smooth} onChange={e => setSmooth((e.currentTarget as HTMLInputElement).checked)} /> صاف‌کردن گاوسی (LoG)</label>
        <Slider label="سطر نمودار" value={row} min={0} max={199} onInput={setRow} display={fa(row, 0)} />
        <label class="btn secondary">عکس خودتان<input type="file" accept="image/*" hidden onChange={onFile} /></label>
      </Controls>
      <svg viewBox="0 0 520 200" width={520} style={{ marginTop: "1rem", marginInline: "auto" }}>
        <line x1={10} x2={510} y1={100} y2={100} class="axis" />
        <polyline fill="none" style="stroke:var(--accent)" stroke-width={1.5} points={line(x => 190 - (src[row * W + x]! / 255) * 180)} />
        <polyline fill="none" style="stroke:var(--accent-2)" stroke-width={1.5} points={line(x => 100 - (lap[row * W + x]! / m) * 90)} />
        <text x={515} y={14} text-anchor="end" font-size={12}>سطر {fa(row, 0)}</text>
      </svg>
      <Readout ltr>
        200×200 = 40000 px · min = {lo.toFixed(0)} · max = {hi.toFixed(0)} · exactly-zero px = {(100 * zeros / (W * H)).toFixed(1)}%
      </Readout>
    </div>
  );
}
