import type { Meta, StoryObj } from '@storybook/react';
import { Waveform } from './index';
import React, { useState, useEffect } from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof Waveform> = {
  title: 'Components/Waveform',
  component: Waveform,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'range', min: 24, max: 120, step: 4 },
    },
    barWidth: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
    },
    barGap: {
      control: { type: 'range', min: 0, max: 8, step: 1 },
    },
    barRadius: {
      control: { type: 'range', min: 0, max: 10, step: 1 },
    },
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
    },
    animated: {
      control: 'boolean',
    },
    color: {
      control: 'color',
    },
    progressColor: {
      control: 'color',
    },
    backgroundColor: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate random waveform data for demos
function generateWaveformData(length: number = 50): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    // Create a natural-looking waveform with peaks and valleys
    const base = 0.3 + Math.random() * 0.4;
    const variation = Math.sin(i * 0.3) * 0.2;
    data.push(Math.max(0.1, Math.min(1, base + variation)));
  }
  return data;
}

const sampleWaveform = generateWaveformData(60);

export const Default: Story = {
  args: {
    staticData: sampleWaveform,
    width: 300,
    height: 48,
    color: '#8B5CF6',
  },
};

export const WithProgress: Story = {
  args: {
    staticData: sampleWaveform,
    width: 300,
    height: 48,
    progress: 0.4,
    color: '#6B7280',
    progressColor: '#8B5CF6',
  },
};

// Animated playback demo
function PlaybackDemo() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveform = React.useMemo(() => generateWaveformData(60), []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          setIsPlaying(false);
          return 0;
        }
        return p + 0.02;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div style={{ width: 300 }}>
      <Waveform
        staticData={waveform}
        progress={progress}
        height={48}
        color="#6B7280"
        progressColor="#8B5CF6"
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button
          onClick={() => {
            if (progress >= 1) setProgress(0);
            setIsPlaying(!isPlaying);
          }}
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#8B5CF6',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

export const PlaybackAnimation: Story = {
  render: () => <PlaybackDemo />,
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Small (24px)</p>
        <Waveform staticData={sampleWaveform} width={300} height={24} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Medium (48px)</p>
        <Waveform staticData={sampleWaveform} width={300} height={48} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Large (80px)</p>
        <Waveform staticData={sampleWaveform} width={300} height={80} />
      </div>
    </div>
  ),
};

export const BarStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Thin bars (2px)</p>
        <Waveform staticData={sampleWaveform} width={300} height={48} barWidth={2} barGap={2} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Thick bars (6px)</p>
        <Waveform staticData={sampleWaveform} width={300} height={48} barWidth={6} barGap={3} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Square bars (0 radius)</p>
        <Waveform staticData={sampleWaveform} width={300} height={48} barRadius={0} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Very rounded (10px radius)</p>
        <Waveform staticData={sampleWaveform} width={300} height={48} barWidth={6} barRadius={10} />
      </div>
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Waveform staticData={sampleWaveform} width={300} height={48} color="#EC4899" />
      <Waveform staticData={sampleWaveform} width={300} height={48} color="#10B981" />
      <Waveform staticData={sampleWaveform} width={300} height={48} color="#F59E0B" />
      <Waveform staticData={sampleWaveform} width={300} height={48} color="#3B82F6" />
    </div>
  ),
};

// Live microphone demo
function LiveMicrophoneDemo() {
  const { stream, isActive, error, start, stop } = useMicrophoneStream();
  const { timeDomainData } = useAudioAnalyser(stream);

  return (
    <div style={{ width: 400 }}>
      <Waveform
        timeDomainData={isActive ? timeDomainData : undefined}
        height={64}
        color="#8B5CF6"
        barWidth={4}
        barGap={2}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
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
            backgroundColor: isActive ? '#EF4444' : '#8B5CF6',
            color: 'white',
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
  parameters: {
    docs: {
      description: {
        story: 'Real-time waveform visualization using your microphone. Click the button to start.',
      },
    },
  },
};

export const ResponsiveWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 600, padding: 16 }}>
      <Waveform
        staticData={sampleWaveform}
        width="100%"
        height={48}
        progress={0.3}
        color="#6B7280"
        progressColor="#8B5CF6"
      />
    </div>
  ),
};
