/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Maps a value from one range to another
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Clamps a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Cubic ease-out function
 * @param t - Input value (0-1)
 * @returns Eased value
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Sine ease-in-out function
 * @param t - Input value (0-1)
 * @returns Eased value
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Quadratic ease-out function
 * @param t - Input value (0-1)
 * @returns Eased value
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Elastic ease-out function for bouncy animations
 * @param t - Input value (0-1)
 * @returns Eased value
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Smoothly interpolates a value towards a target using delta time
 * @param current - Current value
 * @param target - Target value
 * @param smoothing - Smoothing factor (higher = slower)
 * @param deltaTime - Time since last frame (ms)
 * @returns New smoothed value
 */
export function smoothDamp(
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number
): number {
  const t = 1 - Math.pow(smoothing, deltaTime / 16.67);
  return lerp(current, target, t);
}

/**
 * Generates a pseudo-random number based on seed
 * @param seed - Seed value
 * @returns Random number between 0 and 1
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
