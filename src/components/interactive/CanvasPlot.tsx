import { useEffect, useRef } from "preact/hooks";
import { plot, type PlotSpec } from "./plot";
import { useCssVars } from "./hooks";

const THEME_VARS = ["fg", "muted", "border", "font", "accent", "accent-2", "accent-3", "accent-4"] as const;
export type Palette = Record<(typeof THEME_VARS)[number], string>;

interface Props {
  width?: number;
  height?: number;
  label: string;
  /** Build the plot from the current palette; re-drawn whenever the result's inputs or the theme change. */
  spec: (c: Palette) => Omit<PlotSpec, "theme">;
}

/** Canvas chart that follows the site theme. Width scales down with the figure (CSS max-inline-size). */
export function CanvasPlot({ width = 640, height = 320, label, spec }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = useCssVars(THEME_VARS);
  useEffect(() => {
    if (!ref.current || !c.fg) return;
    plot(ref.current, { ...spec(c), theme: { fg: c.fg, muted: c.muted, border: c.border, font: c.font } });
  });
  return <canvas ref={ref} width={width} height={height} role="img" aria-label={label} />;
}
