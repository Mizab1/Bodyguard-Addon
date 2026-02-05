/**
 * Returns a random number in a range
 * @param {number} min min number (inclusive)
 * @param {number} max max number (exclusive)
 * @returns random number in the range
 */
export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Returns a random floating-point number in a range
 * @param {number} min - min number (inclusive)
 * @param {number} max - max number (exclusive)
 * @returns random floating-point number in the range
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
