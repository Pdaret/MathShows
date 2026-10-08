// Membrane separation toolkit (SI units unless noted).
export const RBAR = 0.08314; // L·bar/(mol·K)
export const LMH = 1 / 3.6e6; // 1 L/(m²·h) in m/s

export const flux = (Qp: number, A: number) => Qp / A;
export const recovery = (Qp: number, Qf: number) => Qp / Qf;
export const rejection = (Cp: number, Cf: number) => 1 - Cp / Cf;

/** Darcy: J = ΔP / (μ R_total) [m/s] */
export const darcyFlux = (dP: number, mu: number, Rm: number, Rc = 0) => dP / (mu * (Rm + Rc));

/** Hagen–Poiseuille for straight cylindrical pores: J = ε r² ΔP / (8 μ τ L) */
export const hpFlux = (eps: number, r: number, dP: number, mu: number, tau: number, L: number) =>
  (eps * r * r * dP) / (8 * mu * tau * L);

/**
 * Cake filtration at constant ΔP, cake resistance Rc = K·v.
 * J(t) = J0 / sqrt(1 + t/τ),  τ = μ Rm² / (2 K ΔP)
 */
export function cakeFlux(t: number, dP: number, mu: number, Rm: number, K: number) {
  const J0 = dP / (mu * Rm), tau = (mu * Rm * Rm) / (2 * K * dP);
  return J0 / Math.sqrt(1 + t / tau);
}

/** van 't Hoff: π = i C R T, C from g/L [bar] */
export const osmotic = (gL: number, M: number, i = 2, T = 298.15) => i * (gL / M) * RBAR * T;

export interface RoInput { dP: number; A: number; B: number; Cf: number; k?: number; M?: number; i?: number; T?: number }
export interface RoResult { Jw: number; Cp: number; Cm: number; R: number; Js: number }

/**
 * Solution–diffusion RO with film-theory concentration polarization.
 * Jw = A(ΔP − (π_m − π_p)) [LMH], C_p = B·C_m/(Jw + B), C_m = C_b·exp(Jw/k) (k in LMH, Infinity = no CP).
 */
export function roSolve({ dP, A, B, Cf, k = Infinity, M = 58.44, i = 2, T = 298.15 }: RoInput): RoResult {
  const state = (Jw: number) => {
    const Cm = Cf * Math.exp(Jw / k), Cp = (B * Cm) / (Jw + B);
    return { Cm, Cp, g: A * (dP - osmotic(Cm, M, i, T) + osmotic(Cp, M, i, T)) - Jw };
  };
  // g(Jw) decreases monotonically on [0, A·ΔP] => bisection always converges
  let lo = 0, hi = Math.max(A * dP, 0);
  for (let it = 0; it < 100; it++) {
    const mid = (lo + hi) / 2;
    if (state(mid).g > 0) lo = mid; else hi = mid;
  }
  const Jw = (lo + hi) / 2, { Cm, Cp } = state(Jw);
  return { Jw, Cp, Cm, R: 1 - Cp / Cf, Js: Jw * Cp };
}

/**
 * Binary gas permeation, local (cross-flow) permeate mole fraction at feed fraction x.
 * y/(1−y) = α (x − y/φ) / ((1−x) − (1−y)/φ),  φ = p_feed/p_permeate. Bisection.
 */
export function gasPermeate(x: number, alpha: number, phi: number) {
  const f = (y: number) => y * ((1 - x) - (1 - y) / phi) - alpha * (1 - y) * (x - y / phi);
  let lo = 0, hi = Math.min(1, phi * x); // y can never exceed φ·x
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Minimum (reversible) desalination work per m³ permeate [kWh/m³]; π0 in bar. */
export const minEnergy = (pi0: number, r: number) => (pi0 / 36) * (r > 0 ? Math.log(1 / (1 - r)) / r : 1);

export interface UpperBound { k: number; n: number }
/** Robeson 2008 upper bound P_fast = k·α^n */
export const ROBESON_2008 = {
  O2N2: { k: 1396000, n: -5.666 },
  CO2CH4: { k: 5369140, n: -2.636 },
} satisfies Record<string, UpperBound>;
export const upperBoundAlpha = (P: number, { k, n }: UpperBound) => Math.pow(P / k, 1 / n);
