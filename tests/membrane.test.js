// Run: node tests/membrane.test.js — numbers here are the worked examples in articles/membranes-separation.
const assert = require("assert");
const M = require("../assets/js/membrane.js");
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// Basic definitions: 100 m³/h feed, 45 m³/h permeate, 4500 m² => recovery 45%, flux 10 LMH
near(M.recovery(45, 100), 0.45, 1e-12, "recovery");
near(M.flux(45000, 4500), 10, 1e-12, "flux LMH");
near(M.rejection(0.35, 35), 0.99, 1e-12, "rejection");

// Darcy: ΔP = 1 bar, μ = 1 mPa·s, Rm = 1e12 1/m => 1e-4 m/s = 360 LMH
near(M.darcyFlux(1e5, 1e-3, 1e12) / M.LMH, 360, 1e-9, "darcy");
near(M.darcyFlux(1e5, 1e-3, 1e12, 3e12) / M.LMH, 90, 1e-9, "darcy + cake");

// Hagen–Poiseuille: ε=0.3, r=10 nm, ΔP=1 bar, τ=2, L=1 µm => 1.875e-4 m/s = 675 LMH
near(M.hpFlux(0.3, 10e-9, 1e5, 1e-3, 2, 1e-6) / M.LMH, 675, 1e-6, "hagen-poiseuille");
// halve the radius => flux /4
near(M.hpFlux(0.3, 5e-9, 1e5, 1e-3, 2, 1e-6) / M.LMH, 168.75, 1e-6, "HP r/2");

// Cake: at t = τ flux drops by sqrt(2)
const tau = (1e-3 * 1e24) / (2 * 1e15 * 1e5);
near(M.cakeFlux(tau, 1e5, 1e-3, 1e12, 1e15) / M.LMH, 360 / Math.SQRT2, 1e-9, "cake t=tau");

// van 't Hoff: 35 g/L NaCl at 25 °C ≈ 29.7 bar
near(M.osmotic(35, 58.44), 29.69, 0.01, "seawater pi");
near(M.osmotic(1, 58.44), 0.848, 0.001, "1 g/L pi");

// RO without CP: ΔP=60, A=1 LMH/bar, B=0.05 LMH, 35 g/L
const ro = M.roSolve({ dP: 60, A: 1, B: 0.05, Cf: 35 });
near(ro.Jw, 30.36, 0.01, "RO Jw");
near(ro.R, 0.9984, 0.0002, "RO rejection");
// Below feed osmotic pressure: flux collapses (~0.28 LMH) and rejection drops to ~85%
const low = M.roSolve({ dP: 25, A: 1, B: 0.05, Cf: 35 });
assert.ok(low.Jw < 0.3 && low.R < 0.86, "below pi");
// CP (k = 100 LMH) lowers flux
const roCP = M.roSolve({ dP: 60, A: 1, B: 0.05, Cf: 35, k: 100 });
assert.ok(roCP.Jw < ro.Jw && roCP.Cm > 35, "CP lowers flux");
near(roCP.Jw, 22.79, 0.01, "RO Jw with CP");

// Gas: air x=0.21, α=5. φ→∞ gives ideal y = αx/(1+(α−1)x)
near(M.gasPermeate(0.21, 5, 1e9), 1.05 / 1.84, 1e-6, "ideal gas y");
// pressure ratio limits: φ=3 => y ≤ 0.63 and much lower than ideal
const y3 = M.gasPermeate(0.21, 5, 3);
assert.ok(y3 < 1.05 / 1.84 && y3 > 0.21, "phi-limited");
near(y3, 0.4, 0.01, "y at phi=3");

// Robeson 2008 O2/N2: P(O2)=1 Barrer => α ≈ 12.2
near(M.upperBoundAlpha(1, M.ROBESON_2008.O2N2), 12.15, 0.01, "robeson");

// Minimum desalination work: 0 recovery => π·V = 0.82 kWh/m³; 50% => ≈1.14 kWh/m³ (ideal dilute model)
near(M.minEnergy(29.69, 0), 0.825, 0.001, "Wmin r=0");
near(M.minEnergy(29.69, 0.5), 1.143, 0.001, "Wmin r=0.5");

// RO recovery limit (demos-extra.js): brine osmotic pressure π_c = π_f/(1−r); seawater at r=0.5 ≈ 59 bar
near(M.osmotic(35, 58.44) / (1 - 0.5), 59.38, 0.01, "pi brine r=0.5");

console.log("membrane.js: all checks passed", { Jw: ro.Jw.toFixed(2), JwCP: roCP.Jw.toFixed(2), y3: y3.toFixed(3) });
