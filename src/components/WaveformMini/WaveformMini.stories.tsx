import type { Meta, StoryObj } from '@storybook/react';
import { WaveformMini } from './index';
import React, { useState, useEffect } from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof WaveformMini> = {
  title: 'Components/WaveformMini',
  component: WaveformMini,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    volume: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
    },
    barCount: {
      control: { type: 'range', min: 4, max: 16, step: 1 },
    },
    width: {
      control: { type: 'range', min: 40, max: 200, step: 10 },
    },
    height: {
      control: { type: 'range', min: 16, max: 60, step: 4 },
    },
    color: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    volume: 0.5,
    barCount: 8,
    width: 80,
    height: 24,
    color: '#00EAFF',
  },
};

export const HighVolume: Story = {
  args: {
    volume: 1,
    barCount: 8,
    width: 80,
    height: 24,
    color: '#00EAFF',
  },
};

export const LowVolume: Story = {
  args: {
    volume: 0.2,
    barCount: 8,
    width: 80,
    height: 24,
    color: '#00EAFF',
  },
};

export const MoreBars: Story = {
  args: {
    volume: 0.5,
    barCount: 12,
    width: 120,
    height: 30,
    color: '#00EAFF',
  },
};

export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <WaveformMini color="#00EAFF" volume={0.5} />
      <WaveformMini color="#8B5CF6" volume={0.5} />
      <WaveformMini color="#EC4899" volume={0.5} />
      <WaveformMini color="#10B981" volume={0.5} />
    </div>
  ),
};

// Animated volume demo
function AnimatedDemo() {
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setVolume((prev) => {
        const next = prev + (Math.random() - 0.5) * 0.4;
        return Math.max(0, Math.min(1, next));
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <WaveformMini volume={volume} width={100} height={32} />
      <p style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
        Simulated volume: {(volume * 100).toFixed(0)}%
      </p>
    </div>
  );
}

export const AnimatedVolume: Story = {
  render: () => <AnimatedDemo />,
};

// Live microphone demo
function LiveMicrophoneDemo() {
  const { stream, isActive, error, start, stop } = useMicrophoneStream();
  const { frequencyData, volume } = useAudioAnalyser(stream);

  return (
    <div style={{ textAlign: 'center' }}>
      <WaveformMini
        audioData={isActive ? frequencyData : undefined}
        volume={volume}
        width={120}
        height={36}
        barCount={10}
      />
      <div style={{ marginTop: 24 }}>
        {error && (
          <p style={{ color: '#EF4444', marginBottom: 8, fontSize: 12 }}>
            {error.message}
          </p>
        )}
        <button
          onClick={() => (isActive ? stop() : start())}
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: isActive ? '#EF4444' : '#00EAFF',
            color: isActive ? 'white' : '#0a0a0f',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {isActive ? 'Stop Microphone' : 'Start Microphone'}
        </button>
      </div>
    </div>
  );
}

export const LiveMicrophone: Story = {
  render: () => <LiveMicrophoneDemo />,
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Small (60x20)</p>
        <WaveformMini width={60} height={20} volume={0.5} barCount={6} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Medium (80x24)</p>
        <WaveformMini width={80} height={24} volume={0.5} barCount={8} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Large (120x36)</p>
        <WaveformMini width={120} height={36} volume={0.5} barCount={12} />
      </div>
    </div>
  ),
};
