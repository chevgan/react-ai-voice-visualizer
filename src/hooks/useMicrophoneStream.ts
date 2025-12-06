import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseMicrophoneStreamReturn } from '../types';

/**
 * Hook to capture audio from the user's microphone
 *
 * @example
 * ```tsx
 * const { stream, isActive, error, start, stop } = useMicrophoneStream();
 *
 * const handleClick = async () => {
 *   if (isActive) {
 *     stop();
 *   } else {
 *     await start();
 *   }
 * };
 * ```
 *
 * @returns Object containing stream state and control methods
 */
export function useMicrophoneStream(): UseMicrophoneStreamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep reference to cleanup function
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    // Don't start if already active
    if (streamRef.current) {
      return;
    }

    setError(null);

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to access microphone');

      // Provide more helpful error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          error.message = 'Microphone permission denied by user';
        } else if (err.name === 'NotFoundError') {
          error.message = 'No microphone device found';
        } else if (err.name === 'NotReadableError') {
          error.message = 'Microphone is already in use by another application';
        }
      }

      setError(error);
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      // Stop all tracks
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
      setStream(null);
      setIsActive(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return {
    stream,
    isActive,
    error,
    start,
    stop,
  };
}
