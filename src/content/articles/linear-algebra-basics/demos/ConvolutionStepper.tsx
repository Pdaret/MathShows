import { KERNELS, convolve2d } from "../../../../lib/la";
import { Stepper } from "../../../../components/interactive/Stepper";

const n = 7, m = n - 2, CS = 38;
const img = Array.from({ length: n * n }, (_, k) => {
  const x = k % n, y = (k / n) | 0;
  return x >= 2 && x <= 4 && y >= 2 && y <= 4 ? 200 : 20;
});
const out = Array.from(convolve2d(img, n, n, KERNELS.laplace4, "valid").data);

/** One frame per output pixel: where the 3x3 window sits and which outputs are filled. */
interface Frame { k: number; ox: number; oy: number }
function* algorithm() {
  for (let k = 0; k < m * m; k++) yield { k, ox: k % m, oy: (k / m) | 0 } as Frame;
}

const fill = (v: number) =>
  v > 0 ? `rgba(224,87,58,${Math.min(1, v / 400)})` : v < 0 ? `rgba(47,111,222,${Math.min(1, -v / 400)})` : "transparent";
const px = (ox: number, oy: number, dx: number, dy: number) => img[(oy + 1 + dy) * n + ox + 1 + dx];

/** Fig 9: 3x3 Laplacian kernel sliding over a 7x7 image. */
export default function ConvolutionStepper() {
  return (
    <Stepper<Frame>
      algorithm={algorithm}
      render={({ k, ox, oy }) => (
        <div class="panels">
          <div>
            <svg viewBox={`0 0 ${n * CS + 2} ${n * CS + 2}`} width={n * CS + 2}>
              {img.map((v, i) => {
                const x = i % n, y = (i / n) | 0;
                return (
                  <g>
                    <rect x={1 + x * CS} y={1 + y * CS} width={CS} height={CS} fill={`rgb(${v},${v},${v})`} style="stroke:var(--border)" />
                    <text x={1 + x * CS + CS / 2} y={1 + y * CS + 24} text-anchor="middle" font-size="12" style={`fill:${v > 128 ? "#000" : "#fff"}`}>{v}</text>
                  </g>
                );
              })}
              <rect x={1 + ox * CS} y={1 + oy * CS} width={3 * CS} height={3 * CS} fill="none" stroke-width="3" style="stroke:var(--accent-2)" />
            </svg>
            ورودی ۷×۷
          </div>
          <div>
            <svg viewBox={`0 0 ${m * CS + 2} ${m * CS + 2}`} width={m * CS + 2}>
              {out.map((v, i) => {
                const x = i % m, y = (i / m) | 0, on = i <= k;
                return (
                  <g>
                    <rect x={1 + x * CS} y={1 + y * CS} width={CS} height={CS} fill={on ? fill(v) : "transparent"} style="stroke:var(--border)" stroke-width={i === k ? 3 : 1} />
                    <text x={1 + x * CS + CS / 2} y={1 + y * CS + 24} text-anchor="middle" font-size="11">{on ? v : ""}</text>
                  </g>
                );
              })}
            </svg>
            خروجی ۵×۵ (valid)
          </div>
        </div>
      )}
      describe={({ k, ox, oy }) => {
        const v = (dx: number, dy: number) => px(ox, oy, dx, dy);
        return `O[${oy}][${ox}] = ${v(0, -1)} + ${v(-1, 0)} + ${v(1, 0)} + ${v(0, 1)} − 4·${v(0, 0)} = ${out[k]}`;
      }}
    />
  );
}
