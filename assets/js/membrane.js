// Membrane separation toolkit (SI units unless noted). UMD: window.MEM + module.exports.
(function (root, factory) {
  const lib = factory();
  if (typeof module === "object" && module.exports) module.exports = lib;
  else root.MEM = lib;
})(this, function () {
  const RBAR = 0.08314; // L·bar/(mol·K)
  const LMH = 1 / 3.6e6; // 1 L/(m²·h) in m/s

  // Basic definitions
  const flux = (Qp, A) => Qp / A;                 // same units as Qp per area
  const recovery = (Qp, Qf) => Qp / Qf;
  const rejection = (Cp, Cf) => 1 - Cp / Cf;

  // Darcy: J = ΔP / (μ R_total)  [m/s]
  const darcyFlux = (dP, mu, Rm, Rc = 0) => dP / (mu * (Rm + Rc));

  // Hagen–Poiseuille for straight cylindrical pores: J = ε r² ΔP / (8 μ τ L)
  const hpFlux = (eps, r, dP, mu, tau, L) => (eps * r * r * dP) / (8 * mu * tau * L);

  // Cake filtration at constant ΔP, cake resistance Rc = K·v (v = permeate volume per area, m).
  // J(t) = J0 / sqrt(1 + t/τ),  τ = μ Rm² / (2 K ΔP)
  function cakeFlux(t, dP, mu, Rm, K) {
    const J0 = dP / (mu * Rm), tau = (mu * Rm * Rm) / (2 * K * dP);
    return J0 / Math.sqrt(1 + t / tau);
  }

  // van 't Hoff: π = i C R T, C from g/L
  const osmotic = (gL, M, i = 2, T = 298.15) => i * (gL / M) * RBAR * T;

  // Solution–diffusion RO with film-theory concentration polarization.
  // Jw = A(ΔP − (π_m − π_p)) [LMH], Js = B(C_m − C_p), C_p = Js/Jw, C_m = C_b·exp(Jw/k) (k in LMH, Infinity = no CP)
  function roSolve({ dP, A, B, Cf, k = Infinity, M = 58.44, i = 2, T = 298.15 }) {
    const state = Jw => {
      const Cm = Cf * Math.exp(Jw / k), Cp = (B * Cm) / (Jw + B);
      return { Cm, Cp, g: A * (dP - osmotic(Cm, M, i, T) + osmotic(Cp, M, i, T)) - Jw };
    };
    // g(Jw) decreases monotonically on [0, A·ΔP] => bisection always converges
    let lo = 0, hi = Math.max(A * dP, 0);
    for (let it = 0; it < 100; it++) { const mid = (lo + hi) / 2; if (state(mid).g > 0) lo = mid; else hi = mid; }
    const Jw = (lo + hi) / 2, { Cm, Cp } = state(Jw);
    return { Jw, Cp, Cm, R: 1 - Cp / Cf, Js: Jw * Cp };
  }

  // Binary gas permeation, local (cross-flow) composition at feed mole fraction x.
  // y/(1−y) = α (x − y/φ) / ((1−x) − (1−y)/φ),  φ = p_feed/p_permeate. Solved by bisection.
  function gasPermeate(x, alpha, phi) {
    const f = y => y * ((1 - x) - (1 - y) / phi) - alpha * (1 - y) * (x - y / phi);
    let lo = 0, hi = Math.min(1, phi * x); // y can never exceed φ·x
    for (let it = 0; it < 200; it++) {
      const mid = (lo + hi) / 2;
      if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  // Minimum (reversible) desalination work per m³ permeate, ideal dilute solution [kWh/m³]:
  // W = π0·ln(1/(1−r))/r ; r→0 gives π0. π0 in bar; 1 bar·m³ = 1e5 J = 1/36 kWh.
  const minEnergy = (pi0, r) => (pi0 / 36) * (r > 0 ? Math.log(1 / (1 - r)) / r : 1);

  // Robeson 2008 upper bound P_fast = k·α^n  =>  α = (P/k)^(1/n)
  const ROBESON_2008 = { O2N2: { k: 1396000, n: -5.666 }, CO2CH4: { k: 5369140, n: -2.636 } };
  const upperBoundAlpha = (P, { k, n }) => Math.pow(P / k, 1 / n);

  return { RBAR, LMH, flux, recovery, rejection, darcyFlux, hpFlux, cakeFlux, osmotic, roSolve,
    gasPermeate, minEnergy, ROBESON_2008, upperBoundAlpha };
});
