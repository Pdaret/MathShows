// Membrane modules, flow modes, RO recovery limit and two-stage staging. Depends on window.LA (la.js) and window.MEM (membrane.js).
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
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Run fn(dt) every frame only while el is on screen.
  function animateWhileVisible(el, fn) {
    if (reduceMotion) return fn(0);
    let on = false, last = 0;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); requestAnimationFrame(loop); } }).observe(el);
    function loop(now) { if (!on) return; fn(Math.min(50, now - last) / 1000); last = now; requestAnimationFrame(loop); }
  }

  /* ---------- Fig 4: hollow fibers ---------- */
  function fibers() {
    const g = $("hf-fibers"); if (!g) return;
    for (let i = 0; i < 9; i++) svgEl("line", { x1: 15 + i * 11.5, x2: 15 + i * 11.5, y1: 25, y2: 135, "stroke-width": 6, "stroke-linecap": "round", style: "stroke:var(--accent-4)", "stroke-opacity": .6 }, g);
  }

  /* ---------- Fig 5: dead-end vs cross-flow ---------- */
  function flowDemo() {
    const A = $("deadend-svg"), B = $("crossflow-svg"); if (!A) return;
    function scene(svg, cross) {
      svgEl("rect", { x: 10, y: 150, width: 200, height: 8, fill: "url(#mem-pores)" }, svg);
      const cake = svgEl("rect", { x: 10, y: 150, width: 200, height: 0, style: "fill:var(--accent-2)", "fill-opacity": .6 }, svg);
      const arrows = [40, 110, 180].map(x => svgEl("line", { x1: x, x2: x, y1: 162, y2: 192, "stroke-width": 3, style: "stroke:var(--accent)", "marker-end": "url(#ah-1)" }, svg));
      if (cross) svgEl("line", { x1: 10, x2: 205, y1: 20, y2: 20, "stroke-width": 3, style: "stroke:var(--fg)", "marker-end": "url(#ah-m)" }, svg);
      else svgEl("line", { x1: 110, x2: 110, y1: 5, y2: 40, "stroke-width": 3, style: "stroke:var(--fg)", "marker-end": "url(#ah-m)" }, svg);
      const dots = Array.from({ length: 18 }, () => ({ x: 10 + Math.random() * 200, y: 30 + Math.random() * 100, el: svgEl("circle", { r: 4, style: "fill:var(--accent-2)" }, svg) }));
      return { cake, arrows, dots, h: 0, cross };
    }
    const s = [scene(A, false), scene(B, true)];
    const reset = () => s.forEach(o => (o.h = 0));
    $("flow-reset").onclick = reset;
    animateWhileVisible(A.closest("figure"), dt => {
      for (const o of s) {
        const top = 150 - o.h;
        for (const d of o.dots) {
          d.y += 60 * dt; if (o.cross) d.x += 120 * dt;
          if (d.y >= top - 4) {
            if (o.cross) { if (o.h < 10) o.h += 0.4; } else o.h = Math.min(110, o.h + 1.2);
            d.y = 30; d.x = o.cross ? 10 : 10 + Math.random() * 200;
          }
          if (d.x > 210) { d.x = 10; d.y = 30 + Math.random() * 100; }
          d.el.setAttribute("cx", d.x); d.el.setAttribute("cy", d.y);
        }
        o.cake.setAttribute("y", top); o.cake.setAttribute("height", o.h);
        const flux = 1 / (1 + o.h / 15);    // J ∝ 1/(Rm + Rc), Rc ∝ cake height
        o.arrows.forEach(a => a.setAttribute("stroke-opacity", flux));
      }
    });
  }

  /* ---------- Fig 9: RO pressure vs recovery ---------- */
  function roDemo() {
    const svg = $("rr-svg"); if (!svg) return;
    const X = r => 50 + r * 560, Y = p => 240 - p / 120 * 220;
    function draw() {
      const cf = +$("rr-cf").value, r = +$("rr-r").value / 100, dP = +$("rr-dp").value;
      const pf = MEM.osmotic(cf, 58.44),   // van 't Hoff, same model as the rest of the article
         pc = pf / (1 - r);
      svg.innerHTML = "";
      svgEl("line", { x1: 50, x2: 510, y1: 240, y2: 240, class: "axis" }, svg);
      svgEl("line", { x1: 50, x2: 50, y1: 15, y2: 240, class: "axis" }, svg);
      [0, 20, 40, 60, 80, 100, 120].forEach(p => svgEl("text", { x: 44, y: Y(p) + 4, "text-anchor": "end", "font-size": 11, class: "math" }, svg).textContent = p);
      [0, .2, .4, .6, .8].forEach(v => svgEl("text", { x: X(v), y: 256, "text-anchor": "middle", "font-size": 11, class: "math" }, svg).textContent = v * 100 + "%");
      const curve = [];
      for (let v = 0; v <= .8; v += .01) { const p = pf / (1 - v); if (p <= 120) curve.push(`${X(v)},${Y(p)}`); }
      svgEl("polygon", { points: `${X(0)},${Y(120)} ${curve.join(" ")} ${X(.8)},${Y(120)}`, style: "fill:var(--accent-2)", "fill-opacity": .08 }, svg);
      svgEl("polyline", { points: curve.join(" "), fill: "none", "stroke-width": 2.5, style: "stroke:var(--accent-2)" }, svg);
      svgEl("line", { x1: 50, x2: 510, y1: Y(dP), y2: Y(dP), "stroke-width": 2, "stroke-dasharray": "6 4", style: "stroke:var(--accent)" }, svg);
      const ok = dP > pc;
      svgEl("circle", { cx: X(r), cy: Y(Math.min(dP, 120)), r: 7, style: `fill:var(${ok ? "--accent-3" : "--accent-2"})` }, svg);
      svgEl("text", { x: 500, y: 30, "text-anchor": "end", "font-size": 12 }, svg).textContent = "فشار (bar) بر حسب بازیافت";
      svgEl("text", { x: X(.62), y: Y(110), "text-anchor": "middle", "font-size": 12, style: "fill:var(--accent-2)" }, svg).textContent = "ناحیه‌ی ناممکن";
      const net = dP - (pf + pc) / 2;   // average net driving pressure along the module
      $("rr-info").textContent = `π_f = ${pf.toFixed(1)} bar, π_c = ${pc.toFixed(1)} bar, ΔP = ${dP} bar → ` +
        (ok ? `OK, mean net pressure ≈ ${net.toFixed(1)} bar` : "infeasible: ΔP < π_c, no flux at module outlet");
    }
    ["rr-cf", "rr-r", "rr-dp"].forEach(id => $(id).addEventListener("input", draw));
    draw();
  }

  /* ---------- Fig 12: two-stage mass balance solved as A x = b ---------- */
  function stageDemo() {
    const svg = $("stage-svg"); if (!svg) return;
    function run() {
      const qf = Math.max(0, +$("st-qf").value || 0), r1 = +$("st-r1").value / 100, r2 = +$("st-r2").value / 100;
      const A = [[1, 1, 0, 0], [1, 0, 0, 0], [0, -1, 1, 1], [0, -r2, 1, 0]];
      const [qp1, qc1, qp2, qc2] = LA.solve(A, [qf, r1 * qf, 0, 0]);
      svg.innerHTML = "";
      const W = 480, segs = [[qp1, "--accent", "Q_p1"], [qp2, "--accent-3", "Q_p2"], [qc2, "--accent-2", "Q_c2"]];
      let x = 20;
      for (const [q, c, n] of segs) {
        const w = qf ? q / qf * W : 0;
        svgEl("rect", { x, y: 20, width: w, height: 34, style: `fill:var(${c})`, "fill-opacity": .7 }, svg);
        if (w > 50) svgEl("text", { x: x + w / 2, y: 42, "text-anchor": "middle", "font-size": 12, class: "math" }, svg).textContent = `${n} ${q.toFixed(1)}`;
        x += w;
      }
      svgEl("text", { x: 20 + (qp1 + qp2) / (qf || 1) * W / 2, y: 76, "text-anchor": "middle", "font-size": 12 }, svg).textContent = "محصول";
      $("st-info").textContent = `x = [${[qp1, qc1, qp2, qc2].map(v => v.toFixed(1)).join(", ")}] m³/h · overall recovery = ${(100 * (qp1 + qp2) / (qf || 1)).toFixed(1)}%  (1 − (1−r₁)(1−r₂))`;
    }
    ["st-qf", "st-r1", "st-r2"].forEach(id => $(id).addEventListener("input", run));
    run();
  }

  window.addEventListener("DOMContentLoaded", () => {
    [fibers, flowDemo, roDemo, stageDemo].forEach(fn => {
      try { fn(); } catch (e) { console.error(fn.name, e); }
    });
  });
})();
