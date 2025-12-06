import type { Meta, StoryObj } from '@storybook/react';
import { VoiceTimeline } from './index';
import React, { useState, useEffect, useRef } from 'react';

const meta: Meta<typeof VoiceTimeline> = {
  title: 'Components/VoiceTimeline',
  component: VoiceTimeline,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'range', min: 10, max: 300, step: 10 },
    },
    currentTime: {
      control: { type: 'range', min: 0, max: 120, step: 1 },
    },
    height: {
      control: { type: 'range', min: 32, max: 120, step: 8 },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
          width: 500,
          background: '#1a1a2e',
          borderRadius: 12,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate random waveform data
function generateWaveform(length: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    // Create some variation with occasional peaks
    const base = 0.2 + Math.random() * 0.3;
    const peak = Math.random() > 0.8 ? Math.random() * 0.5 : 0;
    data.push(Math.min(1, base + peak));
  }
  return data;
}

const sampleWaveform = generateWaveform(100);

const sampleSegments = [
  { start: 5, end: 15, label: 'Speaker A' },
  { start: 20, end: 35, label: 'Speaker B' },
  { start: 40, end: 55, label: 'Speaker A' },
  { start: 60, end: 75, label: 'Speaker B' },
];

const sampleMarkers = [
  { time: 18, label: 'Important point', color: '#F59E0B' },
  { time: 45, label: 'Question asked', color: '#10B981' },
];

export const Default: Story = {
  args: {
    duration: 120,
    currentTime: 30,
    showTimeLabels: true,
    showPlayhead: true,
    seekable: true,
  },
};

export const WithWaveform: Story = {
  args: {
    duration: 120,
    currentTime: 45,
    waveformData: sampleWaveform,
    showTimeLabels: true,
  },
};

export const WithSegments: Story = {
  args: {
    duration: 90,
    currentTime: 25,
    segments: sampleSegments,
    showTimeLabels: true,
  },
};

export const WithMarkers: Story = {
  args: {
    duration: 90,
    currentTime: 30,
    markers: sampleMarkers,
    showTimeLabels: true,
  },
};

export const FullFeatured: Story = {
  args: {
    duration: 90,
    currentTime: 25,
    waveformData: sampleWaveform,
    segments: sampleSegments,
    markers: sampleMarkers,
    showTimeLabels: true,
  },
};

export const TallTimeline: Story = {
  args: {
    duration: 120,
    currentTime: 40,
    waveformData: sampleWaveform,
    height: 100,
    showTimeLabels: true,
  },
};

export const CompactTimeline: Story = {
  args: {
    duration: 60,
    currentTime: 20,
    height: 32,
    showTimeLabels: true,
    segments: [
      { start: 5, end: 20 },
      { start: 30, end: 50 },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    duration: 90,
    currentTime: 35,
    waveformData: sampleWaveform,
    segmentColor: '#00F0FF',
    progressColor: '#00F0FF',
    playheadColor: '#EC4899',
    backgroundColor: '#0a0a0f',
  },
};

export const NoTimeLabels: Story = {
  args: {
    duration: 60,
    currentTime: 20,
    showTimeLabels: false,
    waveformData: sampleWaveform,
  },
};

export const NotSeekable: Story = {
  args: {
    duration: 60,
    currentTime: 25,
    seekable: false,
    waveformData: sampleWaveform,
    showTimeLabels: true,
  },
};

// Interactive playback demo
function PlaybackDemo() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = 90;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <VoiceTimeline
      duration={duration}
      currentTime={currentTime}
      isPlaying={isPlaying}
      waveformData={sampleWaveform}
      segments={sampleSegments}
      onSeek={handleSeek}
      onPlayPause={handlePlayPause}
    />
  );
}

export const InteractivePlayback: Story = {
  render: () => <PlaybackDemo />,
};

// Multi-speaker demo
function MultiSpeakerDemo() {
  const [currentTime, setCurrentTime] = useState(15);

  const multiSpeakerSegments = [
    { start: 0, end: 10, label: 'Alice', color: '#8B5CF6', speakerId: 'alice' },
    { start: 12, end: 25, label: 'Bob', color: '#10B981', speakerId: 'bob' },
    { start: 28, end: 40, label: 'Alice', color: '#8B5CF6', speakerId: 'alice' },
    { start: 42, end: 55, label: 'Carol', color: '#F59E0B', speakerId: 'carol' },
    { start: 58, end: 70, label: 'Bob', color: '#10B981', speakerId: 'bob' },
  ];

  return (
    <div>
      <VoiceTimeline
        duration={80}
        currentTime={currentTime}
        segments={multiSpeakerSegments}
        onSeek={setCurrentTime}
        height={80}
      />
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 16,
          fontSize: 12,
        }}
      >
        <span style={{ color: '#8B5CF6' }}>● Alice</span>
        <span style={{ color: '#10B981' }}>● Bob</span>
        <span style={{ color: '#F59E0B' }}>● Carol</span>
      </div>
    </div>
  );
}

export const MultiSpeaker: Story = {
  render: () => <MultiSpeakerDemo />,
};

// Recording simulation
function RecordingDemo() {
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [segments, setSegments] = useState<Array<{ start: number; end: number }>>([]);
  const segmentStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 0.1);

      // Add random waveform data
      setWaveform((prev) => {
        const newValue = 0.2 + Math.random() * 0.6;
        return [...prev, newValue].slice(-200);
      });

      // Simulate voice activity
      if (Math.random() > 0.95) {
        if (segmentStartRef.current === null) {
          segmentStartRef.current = duration;
        }
      } else if (Math.random() > 0.98 && segmentStartRef.current !== null) {
        setSegments((prev) => [
          ...prev,
          { start: segmentStartRef.current!, end: duration },
        ]);
        segmentStartRef.current = null;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, duration]);

  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording, finalize any open segment
      if (segmentStartRef.current !== null) {
        setSegments((prev) => [
          ...prev,
          { start: segmentStartRef.current!, end: duration },
        ]);
        segmentStartRef.current = null;
      }
    }
    setIsRecording(!isRecording);
  };

  const handleReset = () => {
    setDuration(0);
    setWaveform([]);
    setSegments([]);
    setIsRecording(false);
    segmentStartRef.current = null;
  };

  return (
    <div>
      <VoiceTimeline
        duration={Math.max(1, duration)}
        currentTime={duration}
        waveformData={waveform}
        segments={segments}
        showPlayhead={true}
        seekable={false}
        height={80}
      />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={handleToggleRecording}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: isRecording ? '#EF4444' : '#10B981',
            color: 'white',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {isRecording ? '⏹ Stop' : '⏺ Record'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #374151',
            backgroundColor: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export const RecordingSimulation: Story = {
  render: () => <RecordingDemo />,
};

// Long duration demo
export const LongDuration: Story = {
  args: {
    duration: 3600, // 1 hour
    currentTime: 1234,
    segments: [
      { start: 0, end: 300 },
      { start: 600, end: 1200 },
      { start: 1800, end: 2400 },
      { start: 3000, end: 3500 },
    ],
    markers: [
      { time: 900, label: 'Chapter 1' },
      { time: 1800, label: 'Chapter 2' },
      { time: 2700, label: 'Chapter 3' },
    ],
  },
};

// Minimal style
export const MinimalStyle: Story = {
  args: {
    duration: 60,
    currentTime: 20,
    showTimeLabels: false,
    showPlayhead: true,
    height: 24,
    backgroundColor: '#0a0a0f',
    progressColor: '#6366F1',
    playheadColor: '#FFFFFF',
  },
};
