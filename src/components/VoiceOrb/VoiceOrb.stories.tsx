import type { Meta, StoryObj } from '@storybook/react';
import { VoiceOrb } from './index';
import React, { useState, useEffect } from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';
import { VADIndicator } from '../VADIndicator';
import type { VoiceState } from '../../types';

const meta: Meta<typeof VoiceOrb> = {
  title: 'Components/VoiceOrb',
  component: VoiceOrb,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'thinking', 'speaking'],
    },
    size: {
      control: { type: 'range', min: 100, max: 400, step: 10 },
    },
    noiseScale: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
    },
    noiseSpeed: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
    },
    glowIntensity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    volume: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
    },
    primaryColor: {
      control: 'color',
    },
    secondaryColor: {
      control: 'color',
    },
    glowColor: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    state: 'idle',
    size: 200,
  },
};

export const Listening: Story = {
  args: {
    state: 'listening',
    size: 200,
    volume: 0.3,
  },
};

export const Thinking: Story = {
  args: {
    state: 'thinking',
    size: 200,
  },
};

export const Speaking: Story = {
  args: {
    state: 'speaking',
    size: 200,
    volume: 0.5,
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <VoiceOrb state="idle" size={150} />
        <p style={{ color: '#9CA3AF', marginTop: 8 }}>Idle</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <VoiceOrb state="listening" size={150} volume={0.3} />
        <p style={{ color: '#9CA3AF', marginTop: 8 }}>Listening</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <VoiceOrb state="thinking" size={150} />
        <p style={{ color: '#9CA3AF', marginTop: 8 }}>Thinking</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <VoiceOrb state="speaking" size={150} volume={0.5} />
        <p style={{ color: '#9CA3AF', marginTop: 8 }}>Speaking</p>
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <VoiceOrb state="listening" size={100} volume={0.3} />
      <VoiceOrb state="listening" size={150} volume={0.3} />
      <VoiceOrb state="listening" size={200} volume={0.3} />
      <VoiceOrb state="listening" size={250} volume={0.3} />
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      <VoiceOrb
        state="listening"
        size={150}
        volume={0.3}
        primaryColor="#8B5CF6"
        secondaryColor="#EC4899"
      />
      <VoiceOrb
        state="listening"
        size={150}
        volume={0.3}
        primaryColor="#10B981"
        secondaryColor="#3B82F6"
      />
      <VoiceOrb
        state="listening"
        size={150}
        volume={0.3}
        primaryColor="#F59E0B"
        secondaryColor="#EF4444"
      />
      <VoiceOrb
        state="listening"
        size={150}
        volume={0.3}
        primaryColor="#06B6D4"
        secondaryColor="#8B5CF6"
      />
    </div>
  ),
};

// State cycling demo
function StateCycleDemo() {
  const states: VoiceState[] = ['idle', 'listening', 'thinking', 'speaking'];
  const [index, setIndex] = useState(0);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % states.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate volume changes for listening/speaking
  useEffect(() => {
    const interval = setInterval(() => {
      setVolume(0.2 + Math.random() * 0.5);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const currentState = states[index];

  return (
    <div style={{ textAlign: 'center' }}>
      <VoiceOrb
        state={currentState}
        size={250}
        volume={currentState === 'listening' || currentState === 'speaking' ? volume : 0}
      />
      <p style={{ color: '#9CA3AF', marginTop: 16, fontSize: 18 }}>
        State: <strong style={{ color: '#8B5CF6' }}>{currentState}</strong>
      </p>
    </div>
  );
}

export const StateCycle: Story = {
  render: () => <StateCycleDemo />,
};

// Interactive demo with click to change state
function InteractiveDemo() {
  const states: VoiceState[] = ['idle', 'listening', 'thinking', 'speaking'];
  const [stateIndex, setStateIndex] = useState(0);

  return (
    <div style={{ textAlign: 'center' }}>
      <VoiceOrb
        state={states[stateIndex]}
        size={250}
        volume={0.4}
        onClick={() => setStateIndex((i) => (i + 1) % states.length)}
      />
      <p style={{ color: '#9CA3AF', marginTop: 16 }}>
        Click to change state
      </p>
      <p style={{ color: '#8B5CF6', fontSize: 18 }}>
        {states[stateIndex]}
      </p>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// Live microphone demo
function LiveMicrophoneDemo() {
  const { stream, isActive, error, start, stop } = useMicrophoneStream();
  const { frequencyData, volume } = useAudioAnalyser(stream);
  const [state, setState] = useState<VoiceState>('idle');

  // Auto-detect state based on volume
  useEffect(() => {
    if (!isActive) {
      setState('idle');
      return;
    }

    if (volume > 0.1) {
      setState('listening');
    } else {
      setState('listening');
    }
  }, [isActive, volume]);

  return (
    <div style={{ textAlign: 'center' }}>
      <VoiceOrb
        state={state}
        size={250}
        audioData={isActive ? frequencyData : undefined}
        volume={volume}
        onClick={() => (isActive ? stop() : start())}
      />
      <div style={{ marginTop: 24 }}>
        <VADIndicator state={isActive ? 'listening' : 'idle'} size="lg" showLabel />
      </div>
      {error && (
        <p style={{ color: '#EF4444', marginTop: 16, fontSize: 14 }}>
          {error.message}
        </p>
      )}
      <p style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
        Click the orb to {isActive ? 'stop' : 'start'} microphone
      </p>
      <div style={{ marginTop: 8 }}>
        <p style={{ color: '#6B7280', fontSize: 12 }}>
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
        story: 'Real-time audio visualization using your microphone. Click the orb to start.',
      },
    },
  },
};

// Simulated conversation demo
function ConversationDemo() {
  const [state, setState] = useState<VoiceState>('idle');
  const [volume, setVolume] = useState(0);
  const [message, setMessage] = useState('Tap to start');

  useEffect(() => {
    if (state === 'listening' || state === 'speaking') {
      const interval = setInterval(() => {
        setVolume(0.2 + Math.random() * 0.5);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setVolume(0);
    }
  }, [state]);

  const simulateConversation = () => {
    // Simulate a conversation flow
    setState('listening');
    setMessage('Listening to you...');

    setTimeout(() => {
      setState('thinking');
      setMessage('Processing your request...');
    }, 3000);

    setTimeout(() => {
      setState('speaking');
      setMessage('Here\'s my response...');
    }, 5000);

    setTimeout(() => {
      setState('idle');
      setMessage('Tap to start');
    }, 8000);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <VoiceOrb
        state={state}
        size={280}
        volume={volume}
        onClick={state === 'idle' ? simulateConversation : undefined}
      />
      <p style={{ color: '#E5E7EB', marginTop: 24, fontSize: 18 }}>
        {message}
      </p>
      <VADIndicator
        state={state === 'thinking' ? 'processing' : state === 'speaking' ? 'speaking' : state}
        size="lg"
        showLabel
        style={{ marginTop: 16 }}
      />
    </div>
  );
}

export const SimulatedConversation: Story = {
  render: () => <ConversationDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Simulates a voice conversation flow: listening → thinking → speaking → idle',
      },
    },
  },
};

export const HighGlow: Story = {
  args: {
    state: 'listening',
    size: 200,
    glowIntensity: 1,
    volume: 0.4,
  },
};

export const SubtleAnimation: Story = {
  args: {
    state: 'idle',
    size: 200,
    noiseScale: 0.1,
    noiseSpeed: 0.3,
    glowIntensity: 0.2,
  },
};

export const IntenseAnimation: Story = {
  args: {
    state: 'listening',
    size: 200,
    noiseScale: 0.5,
    noiseSpeed: 2,
    glowIntensity: 0.8,
    volume: 0.6,
  },
};
