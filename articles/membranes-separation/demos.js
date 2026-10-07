// Interactive demos for the membrane article. Each init is isolated with try/catch.
(function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const $ = id => document.getElementById(id);
  const fa = (x, d = 1) => Number(x).toLocaleString("fa-IR", { maximumFractionDigits: d, minimumFractionDigits: d });

  // Shared tiny plotter: axes + polylines on a canvas
  function plot(cv, { xmin, xmax, ymin, ymax, xlog, ylog, xlabel, ylabel, series, points = [], vlines = [], legend = [], legendX } ) {
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height, L = 56, R = 28, T = 14, B = 42;
    ctx.direction = "ltr"; // canvas inherits page RTL; keep "22.8 LMH" in order
    const tx = v => xlog ? Math.log10(v) : v, ty = v => ylog ? Math.log10(v) : v;
    const X = v => L + (tx(v) - tx(xmin)) / (tx(xmax) - tx(xmin)) * (W - L - R);
    const Y = v => H - B - (ty(v) - ty(ymin)) / (ty(ymax) - ty(ymin)) * (H - T - B);
    ctx.clearRect(0, 0, W, H);
    ctx.font = "12px " + css("--font"); ctx.lineWidth = 1;
    const ticks = (lo, hi, log) => {
      if (log) { const a = []; for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) a.push(10 ** e); return a; }
      const step = [1, 2, 5, 10, 20, 25, 50, 100].find(s => (hi - lo) / s <= 8) || (hi - lo) / 5;
      const a = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) a.push(+v.toFixed(6)); return a;
    };
    ctx.strokeStyle = css("--border"); ctx.fillStyle = css("--muted");
    ctx.textAlign = "center";
    ticks(xmin, xmax, xlog).forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), T); ctx.lineTo(X(v), H - B); ctx.stroke(); ctx.fillText(String(v), X(v), H - B + 16); });
    ctx.textAlign = "right";
    ticks(ymin, ymax, ylog).forEach(v => { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(W - R, Y(v)); ctx.stroke(); ctx.fillText(String(v), L - 6, Y(v) + 4); });
    ctx.strokeStyle = css("--muted"); ctx.strokeRect(L, T, W - L - R, H - T - B);
    ctx.textAlign = "center"; ctx.fillText(xlabel, (L + W - R) / 2, H - 6);
    ctx.save(); ctx.translate(14, (T + H - B) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(ylabel, 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(L, T, W - L - R, H - T - B); ctx.clip();
    vlines.forEach(({ x, color, dash }) => { ctx.strokeStyle = color; ctx.setLineDash(dash || [5, 4]); ctx.beginPath(); ctx.moveTo(X(x), T); ctx.lineTo(X(x), H - B); ctx.stroke(); ctx.setLineDash([]); });
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2.5; ctx.setLineDash(s.dash || []); ctx.beginPath();
      s.pts.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.setLineDash([]);
    });
    points.forEach(p => {
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 5, 0, 7); ctx.fill();
      if (p.label) { ctx.textAlign = p.align || "left"; ctx.fillStyle = css("--fg"); ctx.fillText(p.label, X(p.x) + (p.align === "right" ? -8 : 8), Y(p.y) + (p.dy ?? -6)); }
    });
    ctx.restore();
    ctx.textAlign = "left";
    legend.forEach(({ text, color, dash }, i) => {
      const y = T + 16 + i * 18; ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.setLineDash(dash || []);
      const lx = legendX ?? L + 10;
      ctx.beginPath(); ctx.moveTo(lx, y - 4); ctx.lineTo(lx + 24, y - 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = css("--fg"); ctx.fillText(text, lx + 30, y);
    });
  }

  // ---------- 1. Sieving animation ----------
  function initSieve() {
    const cv = $("sieve"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height, MX = W / 2;
    const SPECIES = [
      { key: "bac", name: "باکتری", r: 8, color: "--accent-2" },
      { key: "pro", name: "پروتئین", r: 4.5, color: "--accent-4" },
      { key: "dvi", name: "یون دوظرفیتی/قند", r: 3, color: "--accent-3" },
      { key: "na", name: "نمک NaCl", r: 2.3, color: "--accent" },
      { key: "w", name: "آب", r: 1.4, color: "--muted" },
    ];
    // Pass probability per collision with the membrane, per process (order follows SPECIES)
    const PASS = { MF: [0, 1, 1, 1, 1], UF: [0, 0, 1, 1, 1], NF: [0, 0, 0.08, 0.5, 1], RO: [0, 0, 0, 0.01, 1] };
    let mode = "UF", parts = [], counts;
    const reset = () => { counts = SPECIES.map(() => ({ hit: 0, pass: 0 })); parts = []; };
    const spawn = () => {
      const s = Math.random() < 0.45 ? 4 : Math.floor(Math.random() * 4);
      parts.push({ s, x: 10 + Math.random() * 60, y: 20 + Math.random() * (H - 40), vx: 0.6 + Math.random() * 0.8, vy: 0, side: 0, decided: false });
    };
    reset();
    document.querySelectorAll("[data-sieve]").forEach(b => b.addEventListener("click", () => {
      mode = b.dataset.sieve; reset();
      document.querySelectorAll("[data-sieve]").forEach(o => o.classList.toggle("secondary", o !== b));
    }));
    function frame() {
      for (let k = 0; k < 3; k++) if (parts.length < 260) spawn();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = css("--code-bg"); ctx.fillRect(MX, 0, W - MX, H);
      ctx.font = "13px " + css("--font"); ctx.fillStyle = css("--muted"); ctx.textAlign = "center";
      ctx.fillText("خوراک (Feed)", MX / 2, 16); ctx.fillText("تراوه (Permeate)", MX + (W - MX) / 2, 16);
      // membrane with pores; pore gap scales with mode
      const gap = { MF: 18, UF: 8, NF: 4.5, RO: 2.5 }[mode];
      ctx.fillStyle = css("--fg");
      for (let y = 26; y < H; y += 22) ctx.fillRect(MX - 4, y, 8, 22 - gap);
      parts.forEach(p => {
        p.vy += (Math.random() - 0.5) * 0.5; p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;
        if (p.y < 26 || p.y > H - 4) p.vy *= -1, p.y = Math.min(Math.max(p.y, 26), H - 4);
        if (!p.decided && p.x + SPECIES[p.s].r >= MX - 4) {
          p.decided = true; counts[p.s].hit++;
          if (Math.random() < PASS[mode][p.s]) { p.side = 1; counts[p.s].pass++; }
          else { p.x = MX - 4 - SPECIES[p.s].r; p.vx = 0; p.stuck = true; }
        }
        if (p.stuck) p.x = Math.min(p.x, MX - 4 - SPECIES[p.s].r) - Math.random() * 0.25;
      });
      // stuck particles pile up (cake); age them out so the scene doesn't freeze
      parts = parts.filter(p => p.x < W + 10 && !(p.stuck && Math.random() < 0.006));
      parts.forEach(p => {
        const sp = SPECIES[p.s]; ctx.fillStyle = css(sp.color);
        ctx.globalAlpha = sp.key === "w" ? 0.55 : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, sp.r, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
      $("sieve-out").innerHTML = SPECIES.map((sp, i) => {
        const c = counts[i], R = c.hit ? 100 * (1 - c.pass / c.hit) : 0;
        return `<span style="white-space:nowrap;color:${css(sp.color)}">● ${sp.name}: پس‌زنی ${fa(R, 0)}٪</span>`;
      }).join(" &nbsp; ");
      requestAnimationFrame(frame);
    }
    frame();
  }

  // ---------- 2. Hagen–Poiseuille calculator ----------
  function initHP() {
    const ids = ["hp-r", "hp-eps", "hp-L", "hp-dp"];
    const upd = () => {
      const r = +$("hp-r").value, eps = +$("hp-eps").value, L = +$("hp-L").value, dp = +$("hp-dp").value;
      const J = MEM.hpFlux(eps, r * 1e-9, dp * 1e5, 1e-3, 2, L * 1e-6) / MEM.LMH;
      $("hp-r-v").textContent = r; $("hp-eps-v").textContent = eps; $("hp-L-v").textContent = L; $("hp-dp-v").textContent = dp;
      $("hp-out").innerHTML = `شار آب ≈ <b>${fa(J, 0)}</b> LMH (لیتر بر متر مربع بر ساعت) — یک غشای ۱۰۰۰ مترمربعی در ساعت ${fa(J, 0)} مترمکعب آب می‌دهد.`;
    };
    ids.forEach(i => $(i).addEventListener("input", upd)); upd();
  }

  // ---------- 3. Fouling / cake filtration ----------
  function initCake() {
    const cv = $("cake");
    const upd = () => {
      const dp = +$("ck-dp").value, K = 10 ** +$("ck-k").value, Rm = 1e12, mu = 1e-3;
      $("ck-dp-v").textContent = dp; $("ck-k-v").textContent = "10^" + $("ck-k").value;
      const J = t => MEM.cakeFlux(t * 60, dp * 1e5, mu, Rm, K) / MEM.LMH;
      const pts = []; for (let t = 0; t <= 120; t += 1) pts.push([t, J(t)]);
      const ref = []; for (let t = 0; t <= 120; t += 1) ref.push([t, MEM.cakeFlux(t * 60, 1e5, mu, Rm, 1e13) / MEM.LMH]);
      const J0 = J(0);
      plot(cv, { xmin: 0, xmax: 120, ymin: 0, ymax: Math.max(400, Math.ceil(J0 / 100) * 100), xlabel: "زمان (دقیقه)", ylabel: "شار (LMH)",
        series: [{ pts: ref, color: css("--muted"), dash: [5, 4], width: 1.5 }, { pts, color: css("--accent") }],
        points: [{ x: 60, y: J(60), color: css("--accent-2"), label: fa(J(60), 0) + " LMH" }] });
      const tau = mu * Rm * Rm / (2 * K * dp * 1e5) / 60;
      $("ck-out").innerHTML = `شار اولیه ${fa(J0, 0)} LMH · ثابت زمانی τ = ${fa(tau, 1)} دقیقه · بعد از ۶۰ دقیقه ${fa(J(60), 0)} LMH (${fa(100 * J(60) / J0, 0)}٪ شار اولیه)`;
    };
    ["ck-dp", "ck-k"].forEach(i => $(i).addEventListener("input", upd)); upd();
  }

  // ---------- 4. Reverse osmosis ----------
  function initRO() {
    const cv = $("ro");
    const upd = () => {
      const dP = +$("ro-dp").value, Cf = +$("ro-c").value, A = +$("ro-a").value, cp = $("ro-cp").checked;
      const k = cp ? +$("ro-k").value : Infinity, B = 0.05;
      ["ro-dp", "ro-c", "ro-a", "ro-k"].forEach(i => $(i + "-v").textContent = $(i).value);
      const curve = kk => { const a = []; for (let p = 0; p <= 80; p += 0.5) a.push([p, MEM.roSolve({ dP: p, A, B, Cf, k: kk }).Jw]); return a; };
      const r = MEM.roSolve({ dP, A, B, Cf, k });
      const pi = MEM.osmotic(Cf, 58.44);
      plot(cv, { xmin: 0, xmax: 80, ymin: 0, ymax: Math.max(10, Math.ceil(A * (80 - pi) / 10) * 10 + 10), xlabel: "فشار اعمالی ΔP (bar)", ylabel: "شار آب Jw (LMH)",
        series: [{ pts: curve(Infinity), color: css("--accent"), dash: cp ? [5, 4] : [] }].concat(cp ? [{ pts: curve(k), color: css("--accent-2") }] : []),
        vlines: [{ x: pi, color: css("--accent-3") }],
        legend: [{ text: "بدون قطبش غلظت", color: css("--accent"), dash: cp ? [5, 4] : [] }].concat(cp ? [{ text: "با قطبش غلظت", color: css("--accent-2") }] : []).concat([{ text: "π خوراک", color: css("--accent-3"), dash: [5, 4] }]),
        points: [{ x: dP, y: r.Jw, color: css("--fg"), label: fa(r.Jw, 1) + " LMH" }] });
      $("ro-out").innerHTML =
        `فشار اسمزی خوراک π = <b>${fa(pi, 1)}</b> bar (خط‌چین سبز) · شار آب <b>${fa(r.Jw, 1)}</b> LMH · ` +
        `غلظت تراوه ${fa(r.Cp * 1000, 0)} mg/L · پس‌زنی نمک <b>${fa(100 * r.R, 2)}٪</b>` +
        (cp ? ` · غلظت روی سطح غشا ${fa(r.Cm, 1)} g/L (ضریب قطبش ${fa(r.Cm / Cf, 2)})` : "");
    };
    ["ro-dp", "ro-c", "ro-a", "ro-k", "ro-cp"].forEach(i => $(i).addEventListener("input", upd)); upd();
  }

  // ---------- 5. Gas separation: pressure-ratio limit ----------
  function initGas() {
    const cv = $("gas");
    const upd = () => {
      const a = +$("g-a").value, phi = 10 ** +$("g-phi").value, x = +$("g-x").value;
      $("g-a-v").textContent = a; $("g-phi-v").textContent = fa(phi, 1); $("g-x-v").textContent = x;
      const pts = []; for (let e = 0; e <= 3; e += 0.02) pts.push([10 ** e, MEM.gasPermeate(x, a, 10 ** e)]);
      const yIdeal = a * x / (1 + (a - 1) * x), y = MEM.gasPermeate(x, a, phi);
      plot(cv, { xmin: 1, xmax: 1000, xlog: true, ymin: 0, ymax: 1, xlabel: "نسبت فشار φ = p_feed / p_perm", ylabel: "کسر مولی در تراوه y",
        series: [{ pts, color: css("--accent") }, { pts: [[1, yIdeal], [1000, yIdeal]], color: css("--accent-3"), dash: [5, 4], width: 1.5 },
          { pts: [[1, x], [1000, x]], color: css("--muted"), dash: [2, 4], width: 1.5 }],
        points: [{ x: phi, y, color: css("--accent-2"), label: "y = " + y.toFixed(3) }],
        legend: [{ text: "خلوص تراوه", color: css("--accent") }, { text: "سقف غشا (φ→∞)", color: css("--accent-3"), dash: [5, 4] }, { text: "ترکیب خوراک", color: css("--muted"), dash: [2, 4] }] });
      const regime = phi < a / 2 ? "محدود به نسبت فشار — بالا بردن انتخاب‌پذیری فایده‌ی کمی دارد" : phi > 2 * a ? "محدود به انتخاب‌پذیری غشا" : "ناحیه‌ی میانی — هر دو مهم‌اند";
      $("g-out").innerHTML = `خلوص تراوه <b>${fa(100 * y, 1)}٪</b> (سقف ایده‌آل با <bdi>φ→∞</bdi>: ${fa(100 * yIdeal, 1)}٪، سقف فشاری <bdi>φ·x</bdi>: ${fa(Math.min(100, 100 * phi * x), 1)}٪) — ${regime}`;
    };
    ["g-a", "g-phi", "g-x"].forEach(i => $(i).addEventListener("input", upd)); upd();
  }

  // ---------- 6. Robeson plot ----------
  function initRobeson() {
    const cv = $("robeson");
    const ub = MEM.ROBESON_2008.O2N2, ub91 = { k: 389224, n: -5.8 };
    const line = b => { const a = []; for (let e = -2; e <= 4; e += 0.05) a.push([10 ** e, MEM.upperBoundAlpha(10 ** e, b)]); return a; };
    // Typical literature values (approximate, Baker 2012 / Robeson 2008)
    const pts = [
      { x: 600, y: 2.1, label: "PDMS (سیلیکون)", align: "right" },
      { x: 1.4, y: 5.6, label: "پلی‌سولفون", dy: 16 },
      { x: 1.3, y: 6.6, label: "Matrimid", dy: -8 },
      { x: 0.8, y: 6.0, label: "استات سلولز", align: "right", dy: 14 },
      { x: 33, y: 4.0, label: "پلی‌متیل‌پنتن", align: "right" },
    ];
    plot(cv, { xmin: 0.1, xmax: 10000, xlog: true, ymin: 1, ymax: 30, ylog: true, xlabel: "تراوایی O₂ (Barrer)", ylabel: "انتخاب‌پذیری O₂/N₂",
      series: [{ pts: line(ub91), color: css("--muted"), dash: [5, 4], width: 1.5 }, { pts: line(ub), color: css("--accent-2") }],
      points: pts.map(p => Object.assign({ color: css("--accent") }, p)),
      legendX: 430, legend: [{ text: "حد بالای رابسون ۲۰۰۸", color: css("--accent-2") }, { text: "حد ۱۹۹۱", color: css("--muted"), dash: [5, 4] }] });
  }

  window.addEventListener("DOMContentLoaded", () => {
    [initSieve, initHP, initCake, initRO, initGas, initRobeson].forEach(f => { try { f(); } catch (e) { console.error(f.name, e); } });
  });
})();
