import type { Meta, StoryObj } from '@storybook/react';
import { AudioReactiveMesh } from './index';
import React, { useState, useEffect } from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof AudioReactiveMesh> = {
  title: 'Components/AudioReactiveMesh',
  component: AudioReactiveMesh,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'darker',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rows: {
      control: { type: 'range', min: 5, max: 40, step: 1 },
    },
    cols: {
      control: { type: 'range', min: 10, max: 60, step: 1 },
    },
    height: {
      control: { type: 'range', min: 100, max: 400, step: 10 },
    },
    lineWidth: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.5 },
    },
    perspective: {
      control: { type: 'range', min: 0, max: 90, step: 5 },
    },
    waveSpeed: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
    },
    waveHeight: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
    },
    volume: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
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
    width: 600,
    height: 200,
    rows: 20,
    cols: 30,
    color: '#8B5CF6',
  },
};

export const WithVolume: Story = {
  args: {
    width: 600,
    height: 200,
    volume: 0.5,
    color: '#8B5CF6',
  },
};

// Simulated audio demo
function SimulatedAudioDemo() {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate varying audio levels
      setVolume(0.2 + Math.random() * 0.6);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: 700 }}>
      <AudioReactiveMesh
        volume={volume}
        height={250}
        rows={25}
        cols={40}
        color="#8B5CF6"
        waveSpeed={1.5}
      />
      <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
        Simulated audio input
      </p>
    </div>
  );
}

export const SimulatedAudio: Story = {
  render: () => <SimulatedAudioDemo />,
};

export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AudioReactiveMesh width={500} height={150} color="#8B5CF6" volume={0.3} />
      <AudioReactiveMesh width={500} height={150} color="#10B981" volume={0.3} />
      <AudioReactiveMesh width={500} height={150} color="#EC4899" volume={0.3} />
      <AudioReactiveMesh width={500} height={150} color="#F59E0B" volume={0.3} />
    </div>
  ),
};

export const DifferentPerspectives: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Perspective: 30°</p>
        <AudioReactiveMesh width={500} height={150} perspective={30} volume={0.4} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Perspective: 60°</p>
        <AudioReactiveMesh width={500} height={150} perspective={60} volume={0.4} />
      </div>
      <div>
        <p style={{ color: '#9CA3AF', marginBottom: 8, fontSize: 12 }}>Perspective: 80°</p>
        <AudioReactiveMesh width={500} height={150} perspective={80} volume={0.4} />
      </div>
    </div>
  ),
};

export const DenseGrid: Story = {
  args: {
    width: 600,
    height: 200,
    rows: 35,
    cols: 50,
    lineWidth: 0.5,
    volume: 0.4,
    color: '#06B6D4',
  },
};

export const SparseGrid: Story = {
  args: {
    width: 600,
    height: 200,
    rows: 10,
    cols: 15,
    lineWidth: 2,
    volume: 0.4,
    color: '#8B5CF6',
  },
};

export const FastWaves: Story = {
  args: {
    width: 600,
    height: 200,
    waveSpeed: 3,
    waveHeight: 1.5,
    volume: 0.5,
    color: '#EC4899',
  },
};

export const SlowWaves: Story = {
  args: {
    width: 600,
    height: 200,
    waveSpeed: 0.3,
    waveHeight: 0.5,
    volume: 0.3,
    color: '#10B981',
  },
};

// Live microphone demo
function LiveMicrophoneDemo() {
  const { stream, isActive, error, start, stop } = useMicrophoneStream();
  const { frequencyData, volume } = useAudioAnalyser(stream);

  return (
    <div style={{ width: 700 }}>
      <AudioReactiveMesh
        audioData={isActive ? frequencyData : undefined}
        volume={volume}
        height={250}
        rows={25}
        cols={40}
        color="#8B5CF6"
        waveSpeed={1.5}
        waveHeight={1.2}
      />
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        {error && (
          <p style={{ color: '#EF4444', marginBottom: 8, fontSize: 12 }}>
            {error.message}
          </p>
        )}
        <button
          onClick={() => (isActive ? stop() : start())}
          style={{
            padding: '10px 28px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: isActive ? '#EF4444' : '#8B5CF6',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {isActive ? 'Stop Microphone' : 'Start Microphone'}
        </button>
        <p style={{ color: '#6B7280', marginTop: 12, fontSize: 12 }}>
          Volume: {(volume * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
}

export const LiveMicrophone: Story = {
  render: () => <LiveMicrophoneDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Real-time mesh visualization using your microphone. Click the button to start.',
      },
    },
  },
};

export const CyberpunkTheme: Story = {
  render: () => (
    <div
      style={{
        background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
        padding: 40,
        borderRadius: 12,
      }}
    >
      <AudioReactiveMesh
        width={700}
        height={300}
        rows={30}
        cols={50}
        color="#00FFFF"
        lineWidth={1}
        perspective={70}
        waveSpeed={1}
        waveHeight={1.5}
        volume={0.5}
      />
    </div>
  ),
};

export const ResponsiveWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 800, padding: 16 }}>
      <AudioReactiveMesh width="100%" height={200} volume={0.4} />
    </div>
  ),
};
