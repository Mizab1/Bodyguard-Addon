/**
 * Returns a random number in a range
 * @param {*} min min number (inclusive)
 * @param {*} max max number (exclusive)
 * @returns random number in the range
 */
export function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
