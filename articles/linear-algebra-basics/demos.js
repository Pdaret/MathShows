// Interactive figures for the linear-algebra-basics article. Depends on window.LA (assets/js/la.js).
(function () {
  const $ = id => document.getElementById(id);
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

  /* ---------- Fig 4: 2x2 linear transform, animated from identity ---------- */
  function transformDemo() {
    const cv = $("tf-canvas"); if (!cv) return;
    const ctx = cv.getContext("2d"), S = 36, W = cv.width, H = cv.height;
    let cur = [[1, 0], [0, 1]], anim = 0;
    const toPx = ([x, y]) => [W / 2 + x * S, H / 2 - y * S];

    function arrow(M, v, color) {
      const [x, y] = toPx(LA.matVec2(M, v)), [ox, oy] = toPx([0, 0]);
      const a = Math.atan2(y - oy, x - ox);
      ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x - 10 * Math.cos(a - .4), y - 10 * Math.sin(a - .4));
      ctx.lineTo(x - 10 * Math.cos(a + .4), y - 10 * Math.sin(a + .4)); ctx.fill();
    }
    function grid(M, color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      for (let i = -8; i <= 8; i++) {
        for (const [p, q] of [[[i, -8], [i, 8]], [[-8, i], [8, i]]]) {
          ctx.beginPath(); ctx.moveTo(...toPx(LA.matVec2(M, p))); ctx.lineTo(...toPx(LA.matVec2(M, q))); ctx.stroke();
        }
      }
    }
    function draw(M) {
      ctx.clearRect(0, 0, W, H);
      grid([[1, 0], [0, 1]], css("--border"), 1);
      ctx.globalAlpha = .45; grid(M, css("--accent-4"), 1); ctx.globalAlpha = 1;
      ctx.fillStyle = css("--accent"); ctx.globalAlpha = .3; ctx.beginPath();
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach((p, i) => ctx[i ? "lineTo" : "moveTo"](...toPx(LA.matVec2(M, p))));
      ctx.fill(); ctx.globalAlpha = 1;
      arrow(M, [1, 0], css("--accent-2"));
      arrow(M, [0, 1], css("--accent-3"));
    }
    function go(target) {
      const from = cur.map(r => r.slice()), t0 = performance.now();
      cancelAnimationFrame(anim);
      const step = now => {
        const t = Math.min(1, (now - t0) / 700), e = t * t * (3 - 2 * t);
        cur = from.map((r, i) => r.map((v, j) => v + (target[i][j] - v) * e));
        draw(cur);
        if (t < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
      $("tf-info").textContent = `A = [[${target[0]}], [${target[1]}]]   det = ${LA.det2(target).toFixed(2)}` +
        (Math.abs(LA.det2(target)) < 1e-9 ? "  (singular: plane collapses to a line)" : "");
    }
    const read = () => [[+$("tf-a").value, +$("tf-b").value], [+$("tf-c").value, +$("tf-d").value]];
    const presets = {
      "همانی": [[1, 0], [0, 1]], "مقیاس": [[2, 0], [0, 0.5]], "دوران ۹۰°": [[0, -1], [1, 0]],
      "برش": [[1, 1], [0, 1]], "قرینه": [[-1, 0], [0, 1]], "تکین (det=0)": [[1, 2], [0.5, 1]],
    };
    const box = $("tf-presets");
    for (const name in presets) {
      const b = document.createElement("button"); b.className = "secondary"; b.textContent = name;
      b.onclick = () => { const M = presets[name]; [$("tf-a").value, $("tf-b").value, $("tf-c").value, $("tf-d").value] = M.flat(); go(M); };
      box.appendChild(b);
    }
    $("tf-go").onclick = () => go(read());
    go(read());
  }

  /* ---------- Fig 5: matrix multiplication highlight animation ---------- */
  function matmulDemo() {
    const svg = $("matmul-svg"); if (!svg) return;
    const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];
    const C = [[0, 1], [0, 1]].map((_, i) => [0, 1].map(j => A[i][0] * B[0][j] + A[i][1] * B[1][j]));
    const cell = 40, cells = {};
    function mat(M, x0, name, label) {
      cells[name] = M.map((r, i) => r.map((v, j) => {
        const g = svgEl("g", {}, svg);
        const rect = svgEl("rect", { x: x0 + j * cell, y: 50 + i * cell, width: cell, height: cell, fill: "transparent", style: "stroke:var(--border)" }, g);
        const t = svgEl("text", { x: x0 + j * cell + cell / 2, y: 50 + i * cell + 26, "text-anchor": "middle", "font-size": 16 }, g);
        t.textContent = v; return { rect, t };
      }));
      svgEl("text", { x: x0 + cell, y: 35, "text-anchor": "middle", "font-weight": 700 }, svg).textContent = label;
    }
    mat(A, 20, "A", "A"); mat(B, 150, "B", "B"); mat(C, 300, "C", "C = AB");
    svgEl("text", { x: 125, y: 106, "text-anchor": "middle", "font-size": 22 }, svg).textContent = "×";
    svgEl("text", { x: 270, y: 106, "text-anchor": "middle", "font-size": 22 }, svg).textContent = "=";
    let k = 0;
    function tick() {
      const i = k >> 1 & 1, j = k & 1;
      for (const n in cells) cells[n].flat().forEach(c => c.rect.setAttribute("fill", "transparent"));
      cells.C.flat().forEach((c, idx) => c.t.style.opacity = idx <= i * 2 + j || k >= 4 ? 1 : .15);
      cells.A[i].forEach(c => c.rect.setAttribute("fill", css("--accent") + "44"));
      cells.B.forEach(r => r[j].rect.setAttribute("fill", css("--accent-3") + "44"));
      cells.C[i][j].rect.setAttribute("fill", css("--accent-2") + "44");
      $("matmul-info").textContent = `c${i + 1}${j + 1} = ${A[i][0]}·${B[0][j]} + ${A[i][1]}·${B[1][j]} = ${C[i][j]}`;
      k = (k + 1) % 4;
    }
    tick(); setInterval(tick, 1600);
  }

  /* ---------- Fig 6: pixel grid with values ---------- */
  function pixelDemo() {
    const cv = $("pixel-canvas"); if (!cv) return;
    const ctx = cv.getContext("2d"), n = 12, s = cv.width / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - 5.5, y - 5.5);
      const v = Math.round(Math.max(0, Math.min(255, 255 - d * 40)));
      ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x * s, y * s, s, s);
      ctx.fillStyle = v > 128 ? "#000" : "#fff"; ctx.font = "11px monospace"; ctx.textAlign = "center";
      ctx.fillText(v, x * s + s / 2, y * s + s / 2 + 4);
    }
  }

  /* ---------- Fig 8: 1-D profile, first and second derivative ---------- */
  function profileDemo() {
    const svg = $("profile-svg"); if (!svg) return;
    const N = 91, f = Array.from({ length: N }, (_, x) => 20 + 180 / (1 + Math.exp(-(x - 45) / 4)));  // odd N, edge at center sample
    const d1 = f.map((_, x) => x && x < N - 1 ? (f[x + 1] - f[x - 1]) / 2 : 0);
    const d2 = f.map((_, x) => x && x < N - 1 ? f[x + 1] - 2 * f[x] + f[x - 1] : 0);
    const plot = (data, y0, h, color, label, zero) => {
      const max = Math.max(...data.map(Math.abs)) || 1, X = x => 40 + x * (460 / (N - 1));
      const Y = v => zero ? y0 + h / 2 - v / max * h / 2 : y0 + h - v / max * h;
      svgEl("line", { x1: 40, x2: 500, y1: zero ? y0 + h / 2 : y0 + h, y2: zero ? y0 + h / 2 : y0 + h, class: "axis" }, svg);
      svgEl("polyline", { points: data.map((v, x) => `${X(x)},${Y(v)}`).join(" "), fill: "none", stroke: color, "stroke-width": 2.5 }, svg);
      svgEl("text", { x: 505, y: y0 + (data === f ? h - 8 : 14), "text-anchor": "end", "font-size": 13, fill: color }, svg).textContent = label;
    };
    svgEl("line", { x1: 270, x2: 270, y1: 5, y2: 325, "stroke-dasharray": "4 4", class: "muted" }, svg);
    plot(f, 10, 80, css("--accent"), "\u2066f(x)\u2069 روشنایی", false);
    plot(d1, 115, 80, css("--accent-3"), "\u2066f′\u2069 مشتق اول", false);
    plot(d2, 220, 100, css("--accent-2"), "\u2066f″\u2069 مشتق دوم", true);
  }

  /* ---------- Fig 9: sliding kernel animation on a 7x7 image ---------- */
  function slideDemo() {
    const host = $("slide-demo"); if (!host) return;
    const n = 7, img = Array.from({ length: n * n }, (_, i) => {
      const x = i % n, y = (i / n) | 0; return x >= 2 && x <= 4 && y >= 2 && y <= 4 ? 200 : 20;
    });
    const K = LA.KERNELS.laplace4, out = LA.convolve2d(Float32Array.from(img), n, n, K, "valid");
    const cs = 38, mk = (cols, label) => {
      const d = document.createElement("div");
      const s = svgEl("svg", { viewBox: `0 0 ${cols * cs + 2} ${cols * cs + 2}`, width: cols * cs + 2 });
      d.appendChild(s); d.appendChild(document.createElement("br")); d.append(label); host.appendChild(d); return s;
    };
    const sIn = mk(n, "ورودی ۷×۷"), sOut = mk(n - 2, "خروجی ۵×۵ (valid)");
    const inCells = img.map((v, i) => {
      const x = i % n, y = (i / n) | 0;
      svgEl("rect", { x: 1 + x * cs, y: 1 + y * cs, width: cs, height: cs, fill: `rgb(${v},${v},${v})`, style: "stroke:var(--border)" }, sIn);
      const t = svgEl("text", { x: 1 + x * cs + cs / 2, y: 1 + y * cs + 24, "text-anchor": "middle", "font-size": 12, style: `fill:${v > 128 ? "#000" : "#fff"}` }, sIn);
      t.textContent = v; return t;
    });
    const win = svgEl("rect", { width: 3 * cs, height: 3 * cs, fill: "none", "stroke-width": 3, style: "stroke:var(--accent-2)" }, sIn);
    const outCells = Array.from(out.data, (v, i) => {
      const x = i % (n - 2), y = (i / (n - 2)) | 0;
      const r = svgEl("rect", { x: 1 + x * cs, y: 1 + y * cs, width: cs, height: cs, fill: "transparent", style: "stroke:var(--border)" }, sOut);
      const t = svgEl("text", { x: 1 + x * cs + cs / 2, y: 1 + y * cs + 24, "text-anchor": "middle", "font-size": 11 }, sOut);
      return { r, t, v };
    });
    const color = v => v > 0 ? `rgba(224,87,58,${Math.min(1, v / 400)})` : v < 0 ? `rgba(47,111,222,${Math.min(1, -v / 400)})` : "transparent";
    let k = 0, timer = 0;
    function show(k) {
      const ox = k % (n - 2), oy = (k / (n - 2)) | 0;
      win.setAttribute("x", 1 + ox * cs); win.setAttribute("y", 1 + oy * cs);
      outCells.forEach((c, i) => {
        const on = i <= k;
        c.r.setAttribute("fill", on ? color(c.v) : "transparent");
        c.t.textContent = on ? c.v : "";
        c.r.setAttribute("stroke-width", i === k ? 3 : 1);
      });
      const v = (dx, dy) => img[(oy + 1 + dy) * n + ox + 1 + dx];
      $("slide-info").textContent = `O[${oy}][${ox}] = ${v(0, -1)} + ${v(-1, 0)} + ${v(1, 0)} + ${v(0, 1)} − 4·${v(0, 0)} = ${outCells[k].v}`;
    }
    const step = () => { k = (k + 1) % outCells.length; show(k); };
    const stop = () => { clearInterval(timer); timer = 0; $("slide-play").textContent = "پخش"; };
    $("slide-play").onclick = () => {
      if (timer) return stop();
      timer = setInterval(step, 700); $("slide-play").textContent = "توقف";
    };
    $("slide-step").onclick = () => { stop(); step(); };
    $("slide-reset").onclick = () => { stop(); k = 0; show(0); };
    show(0);
  }

  /* ---------- Fig 10: Laplacian on a 200x200 image ---------- */
  function laplaceDemo() {
    if (!$("lp-src")) return;
    const W = 200, H = 200;
    let base = synthetic();

    function synthetic() {
      const a = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let v = 40 + x * 0.5;                                              // linear ramp background
        if (x >= 25 && x < 95 && y >= 30 && y < 110) v = 220;              // rectangle
        if (Math.hypot(x - 145, y - 65) < 32) v = 15;                      // dark disc
        v += 150 * Math.exp(-((x - 120) ** 2 + (y - 155) ** 2) / (2 * 18 ** 2)); // soft gaussian blob
        a[y * W + x] = Math.min(255, v);
      }
      return a;
    }
    function put(id, data, map) {
      const ctx = $(id).getContext("2d"), im = ctx.createImageData(W, H);
      for (let i = 0; i < W * H; i++) {
        const v = Math.max(0, Math.min(255, map(data[i])));
        im.data[4 * i] = im.data[4 * i + 1] = im.data[4 * i + 2] = v; im.data[4 * i + 3] = 255;
      }
      ctx.putImageData(im, 0, 0);
    }
    function run() {
      const noise = +$("lp-noise").value;
      let src = base.map(v => v + (noise ? (Math.random() * 2 - 1) * noise * 1.7 : 0));
      if ($("lp-smooth").checked) src = LA.convolve2d(src, W, H, LA.KERNELS.gauss3).data, src = LA.convolve2d(src, W, H, LA.KERNELS.gauss3).data;
      const lap = LA.convolve2d(src, W, H, LA.KERNELS[$("lp-kernel").value]).data;
      let lo = Infinity, hi = -Infinity, zeros = 0;
      for (const v of lap) { if (v < lo) lo = v; if (v > hi) hi = v; if (Math.abs(v) < 1e-3) zeros++; }
      const m = Math.max(-lo, hi) || 1;
      put("lp-src", src, v => v);
      // sqrt display scaling so weak responses (soft blob) stay visible next to strong step edges
      const sq = v => Math.sign(v) * Math.sqrt(Math.abs(v) / m);
      put("lp-signed", lap, v => 128 + sq(v) * 127);
      put("lp-abs", lap, v => Math.abs(sq(v)) * 255);
      const sharp = src.map((v, i) => v - lap[i]);
      put("lp-sharp", sharp, v => v);
      $("lp-stats").textContent = `200×200 = 40000 px · min = ${lo.toFixed(0)} · max = ${hi.toFixed(0)} · exactly-zero px = ${(100 * zeros / (W * H)).toFixed(1)}%`;
      profile(src, lap);
    }
    function profile(src, lap) {
      const svg = $("lp-profile"); svg.innerHTML = "";
      const row = +$("lp-row").value, X = x => 10 + x * 2.5;
      const m = Math.max(1, ...Array.from({ length: W }, (_, x) => Math.abs(lap[row * W + x])));
      svgEl("line", { x1: 10, x2: 510, y1: 100, y2: 100, class: "axis" }, svg);
      svgEl("polyline", { fill: "none", stroke: css("--accent"), "stroke-width": 1.5,
        points: Array.from({ length: W }, (_, x) => `${X(x)},${190 - src[row * W + x] / 255 * 180}`).join(" ") }, svg);
      svgEl("polyline", { fill: "none", stroke: css("--accent-2"), "stroke-width": 1.5,
        points: Array.from({ length: W }, (_, x) => `${X(x)},${100 - lap[row * W + x] / m * 90}`).join(" ") }, svg);
      svgEl("text", { x: 515, y: 14, "text-anchor": "end", "font-size": 12 }, svg).textContent = `سطر ${fa(row)}`;
      // mark selected row on the input image
      const ctx = $("lp-src").getContext("2d"); ctx.fillStyle = css("--accent-2"); ctx.fillRect(0, row, W, 1);
    }
    ["lp-kernel", "lp-noise", "lp-smooth", "lp-row"].forEach(id => $(id).addEventListener("input", run));
    $("lp-file").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const x = c.getContext("2d"), s = Math.min(img.width, img.height);
        x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, W, H);   // center-crop then resize to 200x200
        const d = x.getImageData(0, 0, W, H).data;
        base = Float32Array.from({ length: W * H }, (_, i) => 0.299 * d[4 * i] + 0.587 * d[4 * i + 1] + 0.114 * d[4 * i + 2]);
        URL.revokeObjectURL(img.src); run();
      };
      img.src = URL.createObjectURL(f);
    });
    run();
  }

  /* ---------- Fig 12: linear classifier ---------- */
  function classifierDemo() {
    const svg = $("clf-svg"); if (!svg) return;
    // deterministic pseudo-random points (LCG) so the figure is stable between reloads
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
    const pts = [];
    for (let i = 0; i < 25; i++) pts.push({ x: [-1.3 + gauss() * .6, -1 + gauss() * .6], c: -1 });
    for (let i = 0; i < 25; i++) pts.push({ x: [1.2 + gauss() * .6, 1.1 + gauss() * .6], c: 1 });
    const S = 50, P = ([x, y]) => [160 + x * S, 160 - y * S];
    function draw() {
      svg.innerHTML = "";
      svgEl("rect", { width: 320, height: 320, fill: "url(#grid40)" }, svg);
      const th = +$("clf-theta").value * Math.PI / 180, b = +$("clf-b").value / 10;
      const w = [Math.cos(th), Math.sin(th)];
      // decision line: w·x + b = 0  -> point -b·w, direction perpendicular to w
      const p0 = [-b * w[0], -b * w[1]], dir = [-w[1], w[0]];
      // shade the positive half-plane (w·x + b > 0)
      svgEl("polygon", {
        points: [[-10, 0], [10, 0], [10, 30], [-10, 30]].map(([t, s]) => P([p0[0] + dir[0] * t + w[0] * s, p0[1] + dir[1] * t + w[1] * s]).join(",")).join(" "),
        style: "fill:var(--accent-2)", "fill-opacity": .12,
      }, svg);
      svgEl("line", { x1: P([p0[0] - dir[0] * 10, p0[1] - dir[1] * 10])[0], y1: P([p0[0] - dir[0] * 10, p0[1] - dir[1] * 10])[1],
        x2: P([p0[0] + dir[0] * 10, p0[1] + dir[1] * 10])[0], y2: P([p0[0] + dir[0] * 10, p0[1] + dir[1] * 10])[1], stroke: css("--fg"), "stroke-width": 2 }, svg);
      const tip = P([p0[0] + w[0], p0[1] + w[1]]);
      svgEl("line", { x1: P(p0)[0], y1: P(p0)[1], x2: tip[0], y2: tip[1], "stroke-width": 3, style: "stroke:var(--accent-4)", "marker-end": "url(#ah-4)" }, svg);
      svgEl("text", { x: tip[0] + 6, y: tip[1] - 6, "font-weight": 700, style: "fill:var(--accent-4)" }, svg).textContent = "w";
      let wrong = 0;
      pts.forEach(p => {
        const pred = LA.dot(w, p.x) + b > 0 ? 1 : -1, bad = pred !== p.c; wrong += bad;
        const [cx, cy] = P(p.x);
        svgEl("circle", { cx, cy, r: 5, style: `fill:var(${p.c > 0 ? "--accent-2" : "--accent"})` }, svg);
        if (bad) svgEl("circle", { cx, cy, r: 9, fill: "none", stroke: css("--fg"), "stroke-width": 1.5 }, svg);
      });
      $("clf-info").textContent = `w = (${w[0].toFixed(2)}, ${w[1].toFixed(2)}), b = ${b.toFixed(1)} · errors: ${wrong}/${pts.length}`;
    }
    ["clf-theta", "clf-b"].forEach(id => $(id).addEventListener("input", draw));
    draw();
  }

  window.addEventListener("DOMContentLoaded", () => {
    [transformDemo, matmulDemo, pixelDemo, profileDemo, slideDemo, laplaceDemo, classifierDemo].forEach(fn => {
      try { fn(); } catch (e) { console.error(fn.name, e); }
    });
  });
})();
