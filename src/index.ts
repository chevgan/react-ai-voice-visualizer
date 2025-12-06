/**
 * react-ai-voice-visualizer
 *
 * A collection of React components for building AI voice interfaces
 * with real-time audio visualization.
 *
 * @packageDocumentation
 */

// Components
export { VoiceOrb } from './components/VoiceOrb';
export { Waveform } from './components/Waveform';
export { AudioReactiveMesh } from './components/AudioReactiveMesh';
export { VADIndicator } from './components/VADIndicator';
export { VoiceWave } from './components/VoiceWave';
export { VoiceParticles } from './components/VoiceParticles';
export { VoiceRing } from './components/VoiceRing';
export { VoiceNeural } from './components/VoiceNeural';

// Mini Components
export { WaveformMini } from './components/WaveformMini';

// Text Components
export { TranscriptionText } from './components/TranscriptionText';

// Confidence Indicators
export { SpeechConfidenceBar } from './components/SpeechConfidenceBar';

// Timeline Components
export { VoiceTimeline } from './components/VoiceTimeline';

// Hooks
export { useMicrophoneStream } from './hooks/useMicrophoneStream';
export { useAudioAnalyser } from './hooks/useAudioAnalyser';
export { useVoiceActivity } from './hooks/useVoiceActivity';

// Utility functions
export {
  normalizeFrequencyData,
  getAverageVolume,
  getFrequencyBands,
  smoothArray,
  downsample,
  envelopeFollower,
  softClip,
} from './utils/audio-utils';

export {
  lerp,
  mapRange,
  clamp,
  easeOutCubic,
  easeInOutSine,
  easeOutQuad,
  easeOutElastic,
  degToRad,
  smoothDamp,
  seededRandom,
} from './utils/math-utils';

// Types
export type {
  VoiceState,
  VADState,
  ComponentSize,
  FrequencyBands,
  SpeechSegment,
  UseMicrophoneStreamReturn,
  UseAudioAnalyserOptions,
  UseAudioAnalyserReturn,
  UseVoiceActivityOptions,
  UseVoiceActivityReturn,
  VoiceOrbProps,
  WaveformProps,
  AudioReactiveMeshProps,
  VADIndicatorProps,
  // Mini Component Types
  WaveformMiniProps,
  // Text Component Types
  TranscriptionAnimationMode,
  TranscriptionTextProps,
  // Confidence Indicator Types
  ConfidenceLevel,
  SpeechConfidenceBarProps,
  // Timeline Types
  TimelineSegment,
  TimelineMarker,
  VoiceTimelineProps,
  // Advanced Visualizer Types
  VoiceWaveProps,
  VoiceParticlesProps,
  VoiceRingProps,
  VoiceNeuralProps,
} from './types';
