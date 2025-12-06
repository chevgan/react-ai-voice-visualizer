import { useState, useEffect, useRef, useCallback } from 'react';
import { getAverageVolume, getFrequencyBands } from '../utils/audio-utils';
import type { UseAudioAnalyserOptions, UseAudioAnalyserReturn } from '../types';

/**
 * Hook for real-time audio analysis using Web Audio API
 *
 * @example
 * ```tsx
 * const { stream } = useMicrophoneStream();
 * const { frequencyData, volume, bassLevel } = useAudioAnalyser(stream, {
 *   fftSize: 256,
 * });
 * ```
 *
 * @param stream - MediaStream from useMicrophoneStream or other source
 * @param options - Configuration options for the analyser
 * @returns Real-time audio analysis data
 */
export function useAudioAnalyser(
  stream: MediaStream | null,
  options: UseAudioAnalyserOptions = {}
): UseAudioAnalyserReturn {
  const { fftSize = 256, smoothingTimeConstant = 0.8 } = options;

  // State for the return values
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(
    () => new Uint8Array(fftSize / 2)
  );
  const [timeDomainData, setTimeDomainData] = useState<Uint8Array>(
    () => new Uint8Array(fftSize)
  );
  const [volume, setVolume] = useState(0);
  const [bassLevel, setBassLevel] = useState(0);
  const [midLevel, setMidLevel] = useState(0);
  const [trebleLevel, setTrebleLevel] = useState(0);

  // Refs to hold audio nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Buffers to avoid allocation in animation loop
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frequencyBufferRef = useRef<any>(new Uint8Array(fftSize / 2));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeDomainBufferRef = useRef<any>(new Uint8Array(fftSize));

  // Update buffers when fftSize changes
  useEffect(() => {
    frequencyBufferRef.current = new Uint8Array(fftSize / 2);
    timeDomainBufferRef.current = new Uint8Array(fftSize);
    setFrequencyData(new Uint8Array(fftSize / 2));
    setTimeDomainData(new Uint8Array(fftSize));
  }, [fftSize]);

  // Animation loop for continuous updates
  const updateAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const freqBuffer = frequencyBufferRef.current;
    const timeBuffer = timeDomainBufferRef.current;

    // Get frequency data
    analyser.getByteFrequencyData(freqBuffer);
    // Get time domain data
    analyser.getByteTimeDomainData(timeBuffer);

    // Calculate volume and frequency bands
    const vol = getAverageVolume(freqBuffer);
    const bands = getFrequencyBands(freqBuffer);

    // Update state with new data (create new arrays to trigger re-render)
    // Use slice() to create a copy that triggers re-render
    setFrequencyData(freqBuffer.slice());
    setTimeDomainData(timeBuffer.slice());
    setVolume(vol);
    setBassLevel(bands.bass);
    setMidLevel(bands.mid);
    setTrebleLevel(bands.treble);

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateAnalysis);
  }, []);

  // Set up audio context and analyser when stream changes
  useEffect(() => {
    if (!stream) {
      // Clean up if stream is removed
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Create audio context
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      console.error('Web Audio API is not supported');
      return;
    }

    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    // Resume context if suspended (required for some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create analyser node
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothingTimeConstant;
    analyserRef.current = analyser;

    // Create source from stream
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    // Connect source to analyser (not to destination to avoid feedback)
    source.connect(analyser);

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateAnalysis);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream, fftSize, smoothingTimeConstant, updateAnalysis]);

  return {
    frequencyData,
    timeDomainData,
    volume,
    bassLevel,
    midLevel,
    trebleLevel,
  };
}
