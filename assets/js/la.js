// Small linear-algebra / image toolkit shared by all articles (browser: window.LA, Node: require).
(function (root) {
  const dot = (a, b) => a.reduce((s, ai, i) => s + ai * b[i], 0);
  const norm = a => Math.sqrt(dot(a, a));
  // 2x2 matrix [[a,b],[c,d]] times vector [x,y]
  const matVec2 = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
  const det2 = M => M[0][0] * M[1][1] - M[0][1] * M[1][0];

  const KERNELS = {
    laplace4: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
    laplace8: [[1, 1, 1], [1, -8, 1], [1, 1, 1]],
    gauss3: [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]],
  };

  // 2D correlation of a grayscale image (row-major Float32Array) with a square odd kernel.
  // pad: "valid" (output shrinks by k-1), "replicate" (edge pixels repeated, same size).
  function convolve2d(src, w, h, kernel, pad = "replicate") {
    const k = kernel.length, r = (k - 1) >> 1;
    const valid = pad === "valid";
    const ow = valid ? w - 2 * r : w, oh = valid ? h - 2 * r : h;
    const out = new Float32Array(ow * oh);
    const clamp = (v, max) => (v < 0 ? 0 : v > max ? max : v);
    for (let oy = 0; oy < oh; oy++) {
      for (let ox = 0; ox < ow; ox++) {
        const cx = valid ? ox + r : ox, cy = valid ? oy + r : oy;
        let s = 0;
        for (let j = 0; j < k; j++) {
          const y = clamp(cy + j - r, h - 1);
          for (let i = 0; i < k; i++) {
            const kv = kernel[j][i];
            if (kv) s += kv * src[y * w + clamp(cx + i - r, w - 1)];
          }
        }
        out[oy * ow + ox] = s;
      }
    }
    return { data: out, w: ow, h: oh };
  }

  const LA = { dot, norm, matVec2, det2, KERNELS, convolve2d };
  if (typeof module !== "undefined" && module.exports) module.exports = LA;
  else root.LA = LA;
})(this);
