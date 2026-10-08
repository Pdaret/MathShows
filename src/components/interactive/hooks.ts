// Shared Preact hooks for interactive figures.
import { useEffect, useRef, useState } from "preact/hooks";

/** Read CSS custom properties from :root; re-reads when the theme changes so canvases can redraw. */
export function useCssVars<K extends string>(names: readonly K[]): Record<K, string> {
  const read = () => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map(n => [n, cs.getPropertyValue(`--${n}`).trim()])) as Record<K, string>;
  };
  const [vars, setVars] = useState<Record<K, string>>(() =>
    typeof document === "undefined" ? ({} as Record<K, string>) : read());
  useEffect(() => {
    const update = () => setVars(read());
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => { mo.disconnect(); mq.removeEventListener("change", update); };
  }, []);
  return vars;
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Call fn(dtSeconds) every frame, but only while `ref` is on screen. Runs once if reduced motion is on. */
export function useAnimationWhileVisible(ref: { current: Element | null }, fn: (dt: number) => void) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { cb.current(0); return; }
    let on = false, last = 0, raf = 0;
    const loop = (now: number) => {
      if (!on) return;
      cb.current(Math.min(50, now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      on = !!e?.isIntersecting;
      if (on) { last = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
}

/** setInterval that is cleared on unmount; pass null to pause. */
export function useInterval(fn: () => void, ms: number | null) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** Persian digits with fixed decimals. */
export const fa = (x: number, d = 1) =>
  Number(x).toLocaleString("fa-IR", { maximumFractionDigits: d, minimumFractionDigits: d });
