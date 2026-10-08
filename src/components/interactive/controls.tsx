import type { ComponentChildren } from "preact";

interface SliderProps {
  label: ComponentChildren;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: ComponentChildren;
  /** Text shown after the slider; defaults to the raw value. */
  display?: ComponentChildren;
  onInput: (v: number) => void;
}

/** Labelled range input. The whole row is a <label>, so tapping the text focuses the slider. */
export function Slider({ label, value, min, max, step = 1, unit, display, onInput }: SliderProps) {
  return (
    <label class="ctl">
      <span class="ctl-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onInput={e => onInput(+(e.currentTarget as HTMLInputElement).value)} />
      <output class="num">{display ?? value}{unit && <> {unit}</>}</output>
    </label>
  );
}

interface ControlsProps { children: ComponentChildren }
export const Controls = ({ children }: ControlsProps) => <div class="controls">{children}</div>;

/** Live numeric readout, announced politely to screen readers. */
export const Readout = ({ children, ltr }: { children: ComponentChildren; ltr?: boolean }) =>
  <p class={ltr ? "readout ltr" : "readout"} aria-live="polite">{children}</p>;
