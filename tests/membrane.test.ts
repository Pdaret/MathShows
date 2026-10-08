// Run: npm test — numbers are the worked examples in the membranes-separation article.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "../src/lib/membrane.ts";

const near = (a: number, b: number, tol: number, msg: string) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test("definitions", () => {
  near(M.recovery(45, 100), 0.45, 1e-12, "recovery");
  near(M.flux(45000, 4500), 10, 1e-12, "flux LMH");
  near(M.rejection(0.35, 35), 0.99, 1e-12, "rejection");
});

test("darcy and hagen-poiseuille", () => {
  near(M.darcyFlux(1e5, 1e-3, 1e12) / M.LMH, 360, 1e-9, "darcy");
  near(M.darcyFlux(1e5, 1e-3, 1e12, 3e12) / M.LMH, 90, 1e-9, "darcy + cake");
  near(M.hpFlux(0.3, 10e-9, 1e5, 1e-3, 2, 1e-6) / M.LMH, 675, 1e-6, "hagen-poiseuille");
  near(M.hpFlux(0.3, 5e-9, 1e5, 1e-3, 2, 1e-6) / M.LMH, 168.75, 1e-6, "HP r/2");
});

test("cake filtration: flux / sqrt(2) at t = tau", () => {
  const tau = (1e-3 * 1e24) / (2 * 1e15 * 1e5);
  near(M.cakeFlux(tau, 1e5, 1e-3, 1e12, 1e15) / M.LMH, 360 / Math.SQRT2, 1e-9, "cake t=tau");
});

test("osmotic pressure", () => {
  near(M.osmotic(35, 58.44), 29.69, 0.01, "seawater pi");
  near(M.osmotic(1, 58.44), 0.848, 0.001, "1 g/L pi");
  near(M.osmotic(35, 58.44) / (1 - 0.5), 59.38, 0.01, "pi brine r=0.5");
});

test("reverse osmosis", () => {
  const ro = M.roSolve({ dP: 60, A: 1, B: 0.05, Cf: 35 });
  near(ro.Jw, 30.36, 0.01, "RO Jw");
  near(ro.R, 0.9984, 0.0002, "RO rejection");
  const low = M.roSolve({ dP: 25, A: 1, B: 0.05, Cf: 35 });
  assert.ok(low.Jw < 0.3 && low.R < 0.86, "below pi");
  const cp = M.roSolve({ dP: 60, A: 1, B: 0.05, Cf: 35, k: 100 });
  assert.ok(cp.Jw < ro.Jw && cp.Cm > 35, "CP lowers flux");
  near(cp.Jw, 22.79, 0.01, "RO Jw with CP");
});

test("gas permeation", () => {
  near(M.gasPermeate(0.21, 5, 1e9), 1.05 / 1.84, 1e-6, "ideal gas y");
  const y3 = M.gasPermeate(0.21, 5, 3);
  assert.ok(y3 < 1.05 / 1.84 && y3 > 0.21, "phi-limited");
  near(y3, 0.4, 0.01, "y at phi=3");
});

test("robeson and minimum energy", () => {
  near(M.upperBoundAlpha(1, M.ROBESON_2008.O2N2), 12.15, 0.01, "robeson");
  near(M.minEnergy(29.69, 0), 0.825, 0.001, "Wmin r=0");
  near(M.minEnergy(29.69, 0.5), 1.143, 0.001, "Wmin r=0.5");
});
