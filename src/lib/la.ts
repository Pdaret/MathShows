// Small linear-algebra / image toolkit shared by all articles.
export type Vec = number[];
export type Mat = number[][];
export type Mat2 = [[number, number], [number, number]];

export const dot = (a: Vec, b: Vec): number => a.reduce((s, ai, i) => s + ai * b[i]!, 0);
export const norm = (a: Vec): number => Math.sqrt(dot(a, a));
export const matVec2 = (M: Mat2, v: Vec): [number, number] => [
  M[0][0] * v[0]! + M[0][1] * v[1]!,
  M[1][0] * v[0]! + M[1][1] * v[1]!,
];
export const det2 = (M: Mat2): number => M[0][0] * M[1][1] - M[0][1] * M[1][0];

export const KERNELS = {
  laplace4: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
  laplace8: [[1, 1, 1], [1, -8, 1], [1, 1, 1]],
  gauss3: [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]],
} satisfies Record<string, Mat>;
export type KernelName = keyof typeof KERNELS;

export interface Image { data: Float32Array; w: number; h: number }

/**
 * 2D correlation of a grayscale image (row-major) with a square odd kernel.
 * pad: "valid" (output shrinks by k-1) or "replicate" (edge pixels repeated, same size).
 */
export function convolve2d(src: ArrayLike<number>, w: number, h: number, kernel: Mat, pad: "valid" | "replicate" = "replicate"): Image {
  const k = kernel.length, r = (k - 1) >> 1;
  const valid = pad === "valid";
  const ow = valid ? w - 2 * r : w, oh = valid ? h - 2 * r : h;
  const out = new Float32Array(ow * oh);
  const clamp = (v: number, max: number) => (v < 0 ? 0 : v > max ? max : v);
  for (let oy = 0; oy < oh; oy++) {
    for (let ox = 0; ox < ow; ox++) {
      const cx = valid ? ox + r : ox, cy = valid ? oy + r : oy;
      let s = 0;
      for (let j = 0; j < k; j++) {
        const y = clamp(cy + j - r, h - 1);
        for (let i = 0; i < k; i++) {
          const kv = kernel[j]![i]!;
          if (kv) s += kv * src[y * w + clamp(cx + i - r, w - 1)]!;
        }
      }
      out[oy * ow + ox] = s;
    }
  }
  return { data: out, w: ow, h: oh };
}

/** Solve A x = b (square, dense) by Gaussian elimination with partial pivoting. */
export function solve(A: Mat, b: Vec): Vec {
  const n = A.length, M = A.map((r, i) => [...r, b[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[p]![c]!)) p = r;
    if (Math.abs(M[p]![c]!) < 1e-12) throw new Error("singular matrix");
    [M[c], M[p]] = [M[p]!, M[c]!];
    for (let r = c + 1; r < n; r++) {
      const f = M[r]![c]! / M[c]![c]!;
      for (let k = c; k <= n; k++) M[r]![k]! -= f * M[c]![k]!;
    }
  }
  const x: Vec = new Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r]![n]!;
    for (let k = r + 1; k < n; k++) s -= M[r]![k]! * x[k]!;
    x[r] = s / M[r]![r]!;
  }
  return x;
}
