// Cryptographically secure dice rolling.
// Uses crypto.getRandomValues with rejection sampling to avoid modulo bias,
// so every face of every die is exactly equally likely.

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error('maxExclusive must be > 0')
  // Largest multiple of maxExclusive that fits in a Uint32, used to reject
  // the biased tail of the range.
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive
  const buf = new Uint32Array(1)
  let x = 0
  do {
    crypto.getRandomValues(buf)
    x = buf[0]
  } while (x >= limit)
  return x % maxExclusive
}

/** Roll a single die with the given number of sides (1..sides inclusive). */
export function rollDie(sides: number): number {
  return secureRandomInt(sides) + 1
}
