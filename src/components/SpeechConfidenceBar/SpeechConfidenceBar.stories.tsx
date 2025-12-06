import type { Meta, StoryObj } from '@storybook/react';
import { SpeechConfidenceBar } from './index';
import React, { useState, useEffect } from 'react';

const meta: Meta<typeof SpeechConfidenceBar> = {
  title: 'Components/SpeechConfidenceBar',
  component: SpeechConfidenceBar,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    confidence: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
    },
    width: {
      control: { type: 'range', min: 100, max: 400, step: 10 },
    },
    height: {
      control: { type: 'range', min: 4, max: 24, step: 2 },
    },
    fontSize: {
      control: { type: 'range', min: 10, max: 18, step: 1 },
    },
    mediumThreshold: {
      control: { type: 'range', min: 0.3, max: 0.7, step: 0.05 },
    },
    highThreshold: {
      control: { type: 'range', min: 0.6, max: 0.95, step: 0.05 },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
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

export const Default: Story = {
  args: {
    confidence: 0.85,
    showLabel: true,
    showLevelText: false,
    width: 200,
    height: 8,
  },
};

export const HighConfidence: Story = {
  args: {
    confidence: 0.95,
    showLabel: true,
    showLevelText: true,
    showGlow: true,
  },
};

export const MediumConfidence: Story = {
  args: {
    confidence: 0.65,
    showLabel: true,
    showLevelText: true,
  },
};

export const LowConfidence: Story = {
  args: {
    confidence: 0.25,
    showLabel: true,
    showLevelText: true,
  },
};

export const WithLevelText: Story = {
  args: {
    confidence: 0.75,
    showLabel: true,
    showLevelText: true,
  },
};

export const CustomLabels: Story = {
  args: {
    confidence: 0.9,
    showLabel: true,
    showLevelText: true,
    levelLabels: {
      low: 'Uncertain',
      medium: 'Probable',
      high: 'Confident',
    },
  },
};

export const LargeBar: Story = {
  args: {
    confidence: 0.8,
    width: 300,
    height: 16,
    fontSize: 14,
    showLabel: true,
    showLevelText: true,
  },
};

export const ThinBar: Story = {
  args: {
    confidence: 0.7,
    width: 200,
    height: 4,
    showLabel: true,
    showLevelText: false,
  },
};

export const NoAnimation: Story = {
  args: {
    confidence: 0.85,
    animated: false,
    showLabel: true,
  },
};

export const NoGlow: Story = {
  args: {
    confidence: 0.95,
    showGlow: false,
    showLabel: true,
    showLevelText: true,
  },
};

export const CustomColors: Story = {
  args: {
    confidence: 0.9,
    lowColor: '#FF6B6B',
    mediumColor: '#4ECDC4',
    highColor: '#00F0FF',
    showLabel: true,
    showLevelText: true,
  },
};

export const CustomThresholds: Story = {
  args: {
    confidence: 0.65,
    mediumThreshold: 0.4,
    highThreshold: 0.7,
    showLabel: true,
    showLevelText: true,
  },
};

// All confidence levels comparison
export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          High Confidence (90%)
        </p>
        <SpeechConfidenceBar
          confidence={0.9}
          showLabel={true}
          showLevelText={true}
        />
      </div>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Medium Confidence (65%)
        </p>
        <SpeechConfidenceBar
          confidence={0.65}
          showLabel={true}
          showLevelText={true}
        />
      </div>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Low Confidence (30%)
        </p>
        <SpeechConfidenceBar
          confidence={0.3}
          showLabel={true}
          showLevelText={true}
        />
      </div>
    </div>
  ),
};

// Animated demo
function AnimatedDemo() {
  const [confidence, setConfidence] = useState(0.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence((prev) => {
        const change = (Math.random() - 0.5) * 0.15;
        return Math.max(0.1, Math.min(0.99, prev + change));
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <SpeechConfidenceBar
        confidence={confidence}
        width={250}
        height={12}
        showLabel={true}
        showLevelText={true}
        fontSize={14}
      />
      <p style={{ color: '#6B7280', marginTop: 16, fontSize: 12 }}>
        Simulating real-time confidence updates...
      </p>
    </div>
  );
}

export const Animated: Story = {
  render: () => <AnimatedDemo />,
};

// Speech recognition simulation
function SpeechRecognitionDemo() {
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [text, setText] = useState('');

  const phrases = [
    { text: 'Hello', confidence: 0.95 },
    { text: 'Hello world', confidence: 0.92 },
    { text: 'Hello world how', confidence: 0.85 },
    { text: 'Hello world how are', confidence: 0.88 },
    { text: 'Hello world how are you', confidence: 0.91 },
  ];

  useEffect(() => {
    if (!isListening) {
      setText('');
      setConfidence(0);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length) {
        setText(phrases[index].text);
        setConfidence(phrases[index].confidence);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
        }, 1500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div style={{ width: 350, textAlign: 'center' }}>
      <div
        style={{
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <p
          style={{
            color: '#FFFFFF',
            fontSize: 18,
            margin: 0,
            fontStyle: text ? 'normal' : 'italic',
          }}
        >
          {text || (isListening ? 'Listening...' : 'Press Start to begin')}
        </p>
      </div>

      <SpeechConfidenceBar
        confidence={confidence}
        width={300}
        height={10}
        showLabel={true}
        showLevelText={true}
      />

      <button
        onClick={() => setIsListening(!isListening)}
        style={{
          marginTop: 24,
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: isListening ? '#EF4444' : '#10B981',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {isListening ? 'Stop' : 'Start Recognition'}
      </button>
    </div>
  );
}

export const SpeechRecognitionSimulation: Story = {
  render: () => <SpeechRecognitionDemo />,
};

// Multiple bars comparison
export const MultipleWords: Story = {
  render: () => {
    const words = [
      { word: 'Hello', confidence: 0.98 },
      { word: 'how', confidence: 0.92 },
      { word: 'are', confidence: 0.85 },
      { word: 'you', confidence: 0.45 },
      { word: 'today', confidence: 0.72 },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
          Word-by-word confidence:
        </p>
        {words.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                width: 60,
                textAlign: 'right',
              }}
            >
              {item.word}
            </span>
            <SpeechConfidenceBar
              confidence={item.confidence}
              width={150}
              height={6}
              showLabel={true}
              showLevelText={false}
              fontSize={11}
            />
          </div>
        ))}
      </div>
    );
  },
};

// Compact inline usage
export const CompactInline: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: '#0a0a0f',
        borderRadius: 8,
      }}
    >
      <span style={{ color: '#FFFFFF', fontSize: 14 }}>
        "The weather is nice today"
      </span>
      <SpeechConfidenceBar
        confidence={0.87}
        width={80}
        height={6}
        showLabel={true}
        showLevelText={false}
        fontSize={10}
      />
    </div>
  ),
};
