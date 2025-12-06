import type { CSSProperties } from 'react';

/**
 * Voice activity states for components
 */
export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * VAD indicator states
 */
export type VADState = 'idle' | 'listening' | 'processing' | 'speaking';

/**
 * Size options for components
 */
export type ComponentSize = 'sm' | 'md' | 'lg';

/**
 * Frequency band levels from audio analysis
 */
export interface FrequencyBands {
  bass: number;
  mid: number;
  treble: number;
}

/**
 * Speech segment recorded by VAD
 */
export interface SpeechSegment {
  startTime: number;
  endTime: number | null;
  duration: number | null;
}

/**
 * Return type for useMicrophoneStream hook
 */
export interface UseMicrophoneStreamReturn {
  /** The active MediaStream, or null if not started */
  stream: MediaStream | null;
  /** Whether the microphone is currently active */
  isActive: boolean;
  /** Any error that occurred during initialization */
  error: Error | null;
  /** Start capturing audio from the microphone */
  start: () => Promise<void>;
  /** Stop capturing audio and release the stream */
  stop: () => void;
}

/**
 * Options for useAudioAnalyser hook
 */
export interface UseAudioAnalyserOptions {
  /** FFT size for frequency analysis (power of 2, default: 256) */
  fftSize?: number;
  /** Smoothing time constant (0-1, default: 0.8) */
  smoothingTimeConstant?: number;
}

/**
 * Return type for useAudioAnalyser hook
 */
export interface UseAudioAnalyserReturn {
  /** Frequency data array (Uint8Array) */
  frequencyData: Uint8Array;
  /** Time domain data array (Uint8Array) */
  timeDomainData: Uint8Array;
  /** Normalized volume level (0-1) */
  volume: number;
  /** Bass frequency level (0-1) */
  bassLevel: number;
  /** Mid frequency level (0-1) */
  midLevel: number;
  /** Treble frequency level (0-1) */
  trebleLevel: number;
}

/**
 * Options for useVoiceActivity hook
 */
export interface UseVoiceActivityOptions {
  /** Volume threshold to detect speech (0-1, default: 0.1) */
  volumeThreshold?: number;
  /** Duration of silence before speech ends (ms, default: 1500) */
  silenceThreshold?: number;
}

/**
 * Return type for useVoiceActivity hook
 */
export interface UseVoiceActivityReturn {
  /** Whether the user is currently speaking */
  isSpeaking: boolean;
  /** Duration of current silence (ms) */
  silenceDuration: number;
  /** Timestamp of last detected speech */
  lastSpeakTime: number | null;
  /** Array of recorded speech segments */
  speechSegments: SpeechSegment[];
}

/**
 * Props for VoiceOrb component
 */
export interface VoiceOrbProps {
  /** Frequency data from useAudioAnalyser */
  audioData?: Uint8Array;
  /** Volume level (0-1), can drive animation without full audioData */
  volume?: number;
  /** Current state of the voice interface */
  state?: VoiceState;
  /** Diameter in pixels (default: 200) */
  size?: number;
  /** Primary color for the orb (default: '#8B5CF6') */
  primaryColor?: string;
  /** Secondary color for gradient (default: '#EC4899') */
  secondaryColor?: string;
  /** Glow color (default: same as primaryColor) */
  glowColor?: string;
  /** Glow intensity (0-1, default: 0.5) */
  glowIntensity?: number;
  /** Deformation intensity (default: 0.3) */
  noiseScale?: number;
  /** Animation speed multiplier (default: 1) */
  noiseSpeed?: number;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for Waveform component
 */
export interface WaveformProps {
  /** Time domain data from useAudioAnalyser (for real-time visualization) */
  timeDomainData?: Uint8Array;
  /** Pre-computed waveform data (for static visualization) */
  staticData?: number[];
  /** Playback progress (0-1) */
  progress?: number;
  /** Width of the component */
  width?: number | string;
  /** Height of the component (default: 48) */
  height?: number;
  /** Width of each bar (default: 3) */
  barWidth?: number;
  /** Gap between bars (default: 2) */
  barGap?: number;
  /** Border radius of bars (default: 2) */
  barRadius?: number;
  /** Color of the waveform (default: '#8B5CF6') */
  color?: string;
  /** Color for played portion */
  progressColor?: string;
  /** Background color (default: 'transparent') */
  backgroundColor?: string;
  /** Enable smooth transitions (default: true) */
  animated?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for AudioReactiveMesh component
 */
export interface AudioReactiveMeshProps {
  /** Frequency data from useAudioAnalyser */
  audioData?: Uint8Array;
  /** Volume level (0-1) */
  volume?: number;
  /** Number of rows in the grid (default: 20) */
  rows?: number;
  /** Number of columns in the grid (default: 30) */
  cols?: number;
  /** Width of the component */
  width?: number | string;
  /** Height of the component (default: 200) */
  height?: number;
  /** Line color (default: '#8B5CF6') */
  color?: string;
  /** Line width (default: 1) */
  lineWidth?: number;
  /** Perspective angle in degrees (default: 60) */
  perspective?: number;
  /** Wave animation speed (default: 1) */
  waveSpeed?: number;
  /** Wave height multiplier (default: 1) */
  waveHeight?: number;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for VADIndicator component
 */
export interface VADIndicatorProps {
  /** Current state of the indicator */
  state: VADState;
  /** Size of the indicator */
  size?: ComponentSize;
  /** Whether to show the state label */
  showLabel?: boolean;
  /** Custom labels for each state */
  labels?: {
    idle?: string;
    listening?: string;
    processing?: string;
    speaking?: string;
  };
  /** Custom colors for each state */
  colors?: {
    idle?: string;
    listening?: string;
    processing?: string;
    speaking?: string;
  };
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for WaveformMini component - Mini equalizer bars
 */
export interface WaveformMiniProps {
  /** Frequency data from useAudioAnalyser */
  audioData?: Uint8Array;
  /** Volume level (0-1) for simulated animation */
  volume?: number;
  /** Number of bars (default: 8) */
  barCount?: number;
  /** Width of the component (default: 80) */
  width?: number;
  /** Height of the component (default: 24) */
  height?: number;
  /** Bar color (default: '#00EAFF') */
  color?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Confidence level thresholds
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Props for SpeechConfidenceBar component - Speech recognition confidence indicator
 */
export interface SpeechConfidenceBarProps {
  /** Confidence value (0-1) */
  confidence: number;
  /** Show percentage label (default: true) */
  showLabel?: boolean;
  /** Show confidence level text (default: false) */
  showLevelText?: boolean;
  /** Custom level labels */
  levelLabels?: {
    low?: string;
    medium?: string;
    high?: string;
  };
  /** Width of the bar (default: 200) */
  width?: number;
  /** Height of the bar (default: 8) */
  height?: number;
  /** Enable animated transitions (default: true) */
  animated?: boolean;
  /** Show glow effect when high confidence (default: true) */
  showGlow?: boolean;
  /** Color for low confidence (default: '#EF4444') */
  lowColor?: string;
  /** Color for medium confidence (default: '#F59E0B') */
  mediumColor?: string;
  /** Color for high confidence (default: '#10B981') */
  highColor?: string;
  /** Background color (default: '#374151') */
  backgroundColor?: string;
  /** Text color for labels (default: '#9CA3AF') */
  labelColor?: string;
  /** Font size for labels (default: 12) */
  fontSize?: number;
  /** Threshold for medium confidence (default: 0.5) */
  mediumThreshold?: number;
  /** Threshold for high confidence (default: 0.8) */
  highThreshold?: number;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Timeline segment representing a speech region
 */
export interface TimelineSegment {
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Optional label for the segment */
  label?: string;
  /** Optional color override for this segment */
  color?: string;
  /** Speaker ID for multi-speaker scenarios */
  speakerId?: string;
}

/**
 * Timeline marker for important points
 */
export interface TimelineMarker {
  /** Time position in seconds */
  time: number;
  /** Label for the marker */
  label?: string;
  /** Marker color */
  color?: string;
}

/**
 * Props for VoiceTimeline component - Interactive audio timeline
 */
export interface VoiceTimelineProps {
  /** Total duration in seconds */
  duration: number;
  /** Current playback position in seconds */
  currentTime?: number;
  /** Speech segments to display */
  segments?: TimelineSegment[];
  /** Markers for important points */
  markers?: TimelineMarker[];
  /** Waveform data for visualization (optional, 0-1 normalized values) */
  waveformData?: number[];
  /** Whether the timeline is playing */
  isPlaying?: boolean;
  /** Called when user seeks to a position */
  onSeek?: (time: number) => void;
  /** Called when user clicks play/pause */
  onPlayPause?: () => void;
  /** Width of the component */
  width?: number | string;
  /** Height of the component (default: 64) */
  height?: number;
  /** Show time labels (default: true) */
  showTimeLabels?: boolean;
  /** Show playhead (default: true) */
  showPlayhead?: boolean;
  /** Enable seeking by click (default: true) */
  seekable?: boolean;
  /** Primary color for segments (default: '#8B5CF6') */
  segmentColor?: string;
  /** Color for the playhead (default: '#FFFFFF') */
  playheadColor?: string;
  /** Background color (default: '#1F2937') */
  backgroundColor?: string;
  /** Waveform color (default: '#374151') */
  waveformColor?: string;
  /** Progress color for played portion (default: '#8B5CF6') */
  progressColor?: string;
  /** Text color for labels (default: '#9CA3AF') */
  labelColor?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Animation mode for TranscriptionText
 */
export type TranscriptionAnimationMode = 'character' | 'word' | 'instant';

/**
 * Props for TranscriptionText component - Live transcription display
 */
export interface TranscriptionTextProps {
  /** Main text to display (finalized transcription) */
  text: string;
  /** Interim text shown in muted color (not yet confirmed) */
  interimText?: string;
  /** Animation mode: character-by-character, word-by-word, or instant (default: 'word') */
  animationMode?: TranscriptionAnimationMode;
  /** Typing speed in milliseconds per unit (default: 50) */
  typingSpeed?: number;
  /** Show blinking cursor at the end (default: true) */
  showCursor?: boolean;
  /** Confidence values for each word (0-1), used for highlighting uncertain words */
  wordConfidences?: number[];
  /** Show confidence-based highlighting (default: false) */
  showConfidence?: boolean;
  /** Main text color (default: '#FFFFFF') */
  textColor?: string;
  /** Interim text color (default: '#6B7280') */
  interimColor?: string;
  /** Cursor color (default: '#8B5CF6') */
  cursorColor?: string;
  /** Color for low confidence words (default: '#F59E0B') */
  lowConfidenceColor?: string;
  /** Font size in pixels (default: 16) */
  fontSize?: number;
  /** Font family (default: 'system-ui, sans-serif') */
  fontFamily?: string;
  /** Line height multiplier (default: 1.5) */
  lineHeight?: number;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for VoiceWave component - Siri-like sine wave visualization
 */
export interface VoiceWaveProps extends Omit<VoiceOrbProps, 'primaryColor' | 'secondaryColor' | 'glowColor'> {
  /** Line color (default: '#FFFFFF') */
  lineColor?: string;
  /** Line width (default: 2) */
  lineWidth?: number;
  /** Number of wave lines (default: 5) */
  numberOfLines?: number;
  /** Phase shift between lines (default: 0.15) */
  phaseShift?: number;
  /** Amplitude multiplier (default: 1) */
  amplitude?: number;
  /** Animation speed multiplier (default: 1) */
  speed?: number;
}

/**
 * Props for VoiceParticles component - Particle swarm visualization
 */
export interface VoiceParticlesProps extends Omit<VoiceOrbProps, 'glowColor'> {
  /** Number of particles (default: 100) */
  particleCount?: number;
  /** Base particle size (default: 3) */
  particleSize?: number;
  /** Animation speed multiplier (default: 1) */
  speed?: number;
}

/**
 * Props for VoiceRing component - Minimal ring with ripples
 */
export interface VoiceRingProps extends VoiceOrbProps {
  /** Ring rotation speed (default: 1) */
  rotationSpeed?: number;
}

/**
 * Props for VoiceNeural component - Neural network visualization
 */
export interface VoiceNeuralProps extends Omit<VoiceOrbProps, 'glowColor'> {
  /** Number of nodes (default: 40) */
  nodeCount?: number;
  /** Max connection distance (default: 100) */
  connectionDistance?: number;
}
