/**
 * Algorithm visualisation contract: an algorithm is a generator that yields one
 * immutable snapshot ("frame") per step. <Stepper> pre-collects the frames so the
 * reader can step backwards as well as forwards.
 */
export type Algorithm<F> = () => Iterable<F>;

// ponytail: eager collection caps at `max` frames; switch to lazy iteration + history buffer if an algorithm needs >10k steps.
export function collectFrames<F>(it: Iterable<F>, max = 10_000): F[] {
  const out: F[] = [];
  for (const f of it) {
    out.push(f);
    if (out.length >= max) break;
  }
  return out;
}
