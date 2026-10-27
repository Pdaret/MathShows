import { dot, type Mat } from "./la.ts";

/** Educational dense, single-head attention; rows represent tokens. */
export function attention(Q: Mat, K: Mat, V: Mat, causal = false) {
  for (const M of [Q, K, V]) {
    if (!M.length || !M[0]?.length || M.some(row => row.length !== M[0]!.length || row.some(x => !Number.isFinite(x)))) {
      throw new RangeError("Matrix must be nonempty, rectangular and finite");
    }
  }
  if (Q[0]!.length !== K[0]!.length || K.length !== V.length) throw new RangeError("Incompatible matrix dimensions");
  if (causal && Q.length !== K.length) throw new RangeError("Causal demo requires aligned self-attention rows");
  const scale = Math.sqrt(Q[0]!.length);
  const scores = Q.map((q, i) => K.map((k, j) => causal && j > i ? -Infinity : dot(q, k) / scale));
  const weights = scores.map(row => {
    if (row.some(s => s !== -Infinity && !Number.isFinite(s)) || !row.some(Number.isFinite)) throw new RangeError("Scores must be finite before masking");
    const max = Math.max(...row);
    const exps = row.map(s => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  });
  const output = weights.map(row => V[0]!.map((_, c) => row.reduce((sum, w, j) => sum + w * V[j]![c]!, 0)));
  return { scores, weights, output };
}

/** Non-overlapping image patches, plus one classification token. No padding. */
export function patchLayout(width: number, height: number, patch: number, channels = 3) {
  if (![width, height, patch, channels].every(x => Number.isSafeInteger(x) && x > 0)) throw new RangeError("Patch geometry requires positive integers");
  if (width % patch || height % patch) throw new RangeError("Patch size must divide both image dimensions");
  const rows = height / patch, cols = width / patch;
  const patches = rows * cols, tokens = patches + 1;
  return { rows, cols, patches, patchDim: patch * patch * channels, tokens, scores: tokens * tokens };
}
