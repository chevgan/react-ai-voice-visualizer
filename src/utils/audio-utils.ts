import type { FrequencyBands } from '../types';

/** Audio data type that works with Web Audio API */
type AudioDataArray = { readonly length: number; [index: number]: number };

/**
 * Normalizes frequency data from Uint8Array (0-255) to number array (0-1)
 * @param data - Raw frequency data
 * @returns Normalized array
 */
export function normalizeFrequencyData(data: AudioDataArray): number[] {
  const normalized = new Array<number>(data.length);
  for (let i = 0; i < data.length; i++) {
    normalized[i] = data[i] / 255;
  }
  return normalized;
}

/**
 * Calculates the average volume (RMS) from audio data
 * @param data - Frequency or time domain data
 * @returns Volume level (0-1)
 */
export function getAverageVolume(data: AudioDataArray): number {
  if (data.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = data[i] / 255;
    sum += normalized * normalized;
  }

  return Math.sqrt(sum / data.length);
}

/**
 * Extracts bass, mid, and treble levels from frequency data
 * @param data - Frequency data from analyser
 * @returns Object with bass, mid, and treble levels (0-1)
 */
export function getFrequencyBands(data: AudioDataArray): FrequencyBands {
  if (data.length === 0) {
    return { bass: 0, mid: 0, treble: 0 };
  }

  const length = data.length;
  // Divide spectrum into thirds (approximately)
  // Bass: 0-300Hz, Mid: 300-2000Hz, Treble: 2000Hz+
  const bassEnd = Math.floor(length * 0.1);
  const midEnd = Math.floor(length * 0.5);

  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;

  for (let i = 0; i < length; i++) {
    const value = data[i] / 255;
    if (i < bassEnd) {
      bassSum += value;
    } else if (i < midEnd) {
      midSum += value;
    } else {
      trebleSum += value;
    }
  }

  const bassCount = bassEnd || 1;
  const midCount = midEnd - bassEnd || 1;
  const trebleCount = length - midEnd || 1;

  return {
    bass: bassSum / bassCount,
    mid: midSum / midCount,
    treble: trebleSum / trebleCount,
  };
}

/**
 * Smoothly interpolates between two arrays
 * @param current - Current values
 * @param previous - Previous values (will be modified)
 * @param factor - Smoothing factor (0 = no change, 1 = instant)
 * @returns Smoothed array
 */
export function smoothArray(
  current: number[],
  previous: number[],
  factor: number
): number[] {
  const result = new Array<number>(current.length);

  for (let i = 0; i < current.length; i++) {
    const prev = previous[i] ?? 0;
    result[i] = prev + (current[i] - prev) * factor;
  }

  return result;
}

/**
 * Downsamples audio data to a target number of samples
 * @param data - Input data
 * @param targetLength - Desired output length
 * @returns Downsampled array
 */
export function downsample(data: AudioDataArray | number[], targetLength: number): number[] {
  const result = new Array<number>(targetLength);
  const blockSize = Math.floor(data.length / targetLength);

  for (let i = 0; i < targetLength; i++) {
    let sum = 0;
    const start = i * blockSize;
    const end = Math.min(start + blockSize, data.length);

    for (let j = start; j < end; j++) {
      sum += typeof data[j] === 'number' ? data[j] : (data[j] as number) / 255;
    }

    result[i] = sum / (end - start);
  }

  return result;
}

/**
 * Creates a decay effect on values (useful for smooth falloff)
 * @param current - Current value
 * @param target - Target value
 * @param attackTime - Time to reach target when increasing
 * @param releaseTime - Time to reach target when decreasing
 * @returns New value
 */
export function envelopeFollower(
  current: number,
  target: number,
  attackTime: number,
  releaseTime: number
): number {
  const factor = target > current ? attackTime : releaseTime;
  return current + (target - current) * factor;
}

/**
 * Applies a gain/multiplier with soft clipping to prevent distortion
 * @param value - Input value (0-1)
 * @param gain - Gain multiplier
 * @returns Soft-clipped value (0-1)
 */
export function softClip(value: number, gain: number = 1): number {
  const x = value * gain;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
