/** RFC 5905 §8: timestamps share units; offset is server minus client. */
export function ntpExchange(t1: number, t2: number, t3: number, t4: number) {
  return {
    offset: ((t2 - t1) + (t3 - t4)) / 2,
    delay: (t4 - t1) - (t3 - t2),
  };
}
