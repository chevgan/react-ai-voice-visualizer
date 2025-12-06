import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  UseVoiceActivityOptions,
  UseVoiceActivityReturn,
  SpeechSegment,
} from '../types';

/**
 * Hook for Voice Activity Detection (VAD)
 * Detects when the user starts and stops speaking based on volume levels
 *
 * @example
 * ```tsx
 * const { volume } = useAudioAnalyser(stream);
 * const { isSpeaking, silenceDuration, speechSegments } = useVoiceActivity(volume, {
 *   volumeThreshold: 0.1,
 *   silenceThreshold: 1500,
 * });
 * ```
 *
 * @param volume - Current volume level (0-1) from useAudioAnalyser
 * @param options - Configuration options
 * @returns Voice activity detection state
 */
export function useVoiceActivity(
  volume: number,
  options: UseVoiceActivityOptions = {}
): UseVoiceActivityReturn {
  const { volumeThreshold = 0.1, silenceThreshold = 1500 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [lastSpeakTime, setLastSpeakTime] = useState<number | null>(null);
  const [speechSegments, setSpeechSegments] = useState<SpeechSegment[]>([]);

  // Refs for tracking state without causing re-renders
  const silenceStartRef = useRef<number | null>(null);
  const wasSpeakingRef = useRef(false);
  const currentSegmentRef = useRef<SpeechSegment | null>(null);

  // Update silence duration and speaking state
  const updateVoiceActivity = useCallback(() => {
    const now = Date.now();
    const isAboveThreshold = volume >= volumeThreshold;

    if (isAboveThreshold) {
      // User is speaking
      silenceStartRef.current = null;
      setSilenceDuration(0);
      setLastSpeakTime(now);

      if (!wasSpeakingRef.current) {
        // Just started speaking - create new segment
        wasSpeakingRef.current = true;
        setIsSpeaking(true);

        const newSegment: SpeechSegment = {
          startTime: now,
          endTime: null,
          duration: null,
        };
        currentSegmentRef.current = newSegment;
        setSpeechSegments((prev) => [...prev, newSegment]);
      }
    } else {
      // User is silent
      if (silenceStartRef.current === null) {
        silenceStartRef.current = now;
      }

      const currentSilence = now - silenceStartRef.current;
      setSilenceDuration(currentSilence);

      if (wasSpeakingRef.current && currentSilence >= silenceThreshold) {
        // Silence threshold reached - user stopped speaking
        wasSpeakingRef.current = false;
        setIsSpeaking(false);

        // Complete the current segment
        if (currentSegmentRef.current) {
          const endTime = silenceStartRef.current; // Use silence start as end
          const segment = currentSegmentRef.current;

          setSpeechSegments((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].startTime === segment.startTime) {
              updated[lastIndex] = {
                ...segment,
                endTime,
                duration: endTime - segment.startTime,
              };
            }
            return updated;
          });

          currentSegmentRef.current = null;
        }
      }
    }
  }, [volume, volumeThreshold, silenceThreshold]);

  // Run voice activity detection on volume changes
  useEffect(() => {
    updateVoiceActivity();
  }, [updateVoiceActivity]);

  return {
    isSpeaking,
    silenceDuration,
    lastSpeakTime,
    speechSegments,
  };
}
