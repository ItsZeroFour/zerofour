// Production CSS may shorten 900ms to .9s, including custom properties.
export function cssMilliseconds(time: string): number {
  return parseFloat(time) * (time.trim().endsWith('ms') ? 1 : 1000);
}
