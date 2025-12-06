import type { Meta, StoryObj } from '@storybook/react';
import { TranscriptionText } from './index';
import React, { useState, useEffect } from 'react';

const meta: Meta<typeof TranscriptionText> = {
  title: 'Components/TranscriptionText',
  component: TranscriptionText,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    animationMode: {
      control: 'select',
      options: ['character', 'word', 'instant'],
    },
    typingSpeed: {
      control: { type: 'range', min: 10, max: 200, step: 10 },
    },
    fontSize: {
      control: { type: 'range', min: 12, max: 32, step: 2 },
    },
    showCursor: {
      control: 'boolean',
    },
    showConfidence: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 32,
          maxWidth: 600,
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
    text: 'Hello, this is a live transcription example.',
    showCursor: true,
    animationMode: 'word',
    typingSpeed: 50,
  },
};

export const CharacterByCharacter: Story = {
  args: {
    text: 'Typing character by character like a typewriter...',
    animationMode: 'character',
    typingSpeed: 30,
    showCursor: true,
  },
};

export const WordByWord: Story = {
  args: {
    text: 'This text appears word by word, perfect for real-time transcription.',
    animationMode: 'word',
    typingSpeed: 100,
    showCursor: true,
  },
};

export const Instant: Story = {
  args: {
    text: 'This text appears instantly without animation.',
    animationMode: 'instant',
    showCursor: true,
  },
};

export const WithInterimText: Story = {
  args: {
    text: 'The quick brown fox ',
    interimText: 'jumps over...',
    animationMode: 'instant',
    showCursor: true,
  },
};

export const WithConfidence: Story = {
  args: {
    text: 'Hello world this is uncertain text here',
    wordConfidences: [0.98, 0.95, 0.92, 0.45, 0.3, 0.88, 0.91],
    showConfidence: true,
    animationMode: 'instant',
    showCursor: true,
  },
};

export const NoCursor: Story = {
  args: {
    text: 'This transcription has no cursor.',
    showCursor: false,
    animationMode: 'instant',
  },
};

export const CustomColors: Story = {
  args: {
    text: 'Custom colored transcription text',
    textColor: '#00F0FF',
    cursorColor: '#EC4899',
    animationMode: 'word',
    typingSpeed: 80,
  },
};

export const LargeText: Story = {
  args: {
    text: 'Large transcription display',
    fontSize: 28,
    animationMode: 'word',
    typingSpeed: 100,
  },
};

// Live simulation demo
function LiveTranscriptionDemo() {
  const phrases = [
    'Hello, how can I help you today?',
    'I can assist with various tasks.',
    'Just speak naturally and I will transcribe.',
    'Voice recognition is getting better every day.',
    'This is a demonstration of live transcription.',
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex];
    const words = phrase.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        // Show current word as interim
        setInterimText(words[wordIndex] + ' ');

        // After a delay, move interim to final
        setTimeout(() => {
          setText((prev) => prev + words[wordIndex - 1] + ' ');
          setInterimText('');
        }, 300);

        wordIndex++;
      } else {
        // Move to next phrase
        clearInterval(interval);
        setTimeout(() => {
          setText('');
          setInterimText('');
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentPhraseIndex]);

  return (
    <div>
      <TranscriptionText
        text={text}
        interimText={interimText}
        animationMode="instant"
        fontSize={18}
      />
      <p
        style={{ color: '#6B7280', marginTop: 16, fontSize: 12, marginBottom: 0 }}
      >
        Simulating live speech-to-text...
      </p>
    </div>
  );
}

export const LiveSimulation: Story = {
  render: () => <LiveTranscriptionDemo />,
};

// Incremental update demo
function IncrementalDemo() {
  const [text, setText] = useState('');
  const fullText =
    'This demonstrates incremental text updates, where new words are added progressively to simulate real-time transcription from a speech recognition service.';

  useEffect(() => {
    const words = fullText.split(' ');
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        setText(words.slice(0, index + 1).join(' '));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setText('');
          index = 0;
        }, 3000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <TranscriptionText
      text={text}
      animationMode="word"
      typingSpeed={30}
      fontSize={16}
    />
  );
}

export const IncrementalUpdates: Story = {
  render: () => <IncrementalDemo />,
};

// Interactive demo
function InteractiveDemo() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setText((prev) => (prev ? prev + ' ' : '') + input);
    setInput('');
  };

  return (
    <div style={{ width: 500 }}>
      <TranscriptionText
        text={text || 'Start typing below...'}
        animationMode="word"
        typingSpeed={40}
        fontSize={18}
        textColor={text ? '#FFFFFF' : '#6B7280'}
      />

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a word and press Enter"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#0a0a0f',
            color: '#FFFFFF',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </form>

      <button
        onClick={() => setText('')}
        style={{
          marginTop: 12,
          padding: '8px 16px',
          borderRadius: 6,
          border: 'none',
          background: '#374151',
          color: '#FFFFFF',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Clear
      </button>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// Speed comparison
export const SpeedComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Fast (30ms)
        </p>
        <TranscriptionText
          text="Fast typing speed demonstration"
          animationMode="character"
          typingSpeed={30}
        />
      </div>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Medium (80ms)
        </p>
        <TranscriptionText
          text="Medium typing speed demonstration"
          animationMode="character"
          typingSpeed={80}
        />
      </div>
      <div>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Slow (150ms)
        </p>
        <TranscriptionText
          text="Slow typing speed demonstration"
          animationMode="character"
          typingSpeed={150}
        />
      </div>
    </div>
  ),
};

// Confidence visualization
function ConfidenceDemo() {
  const text = 'Hello I am very uncertain about these last words';
  const confidences = [0.99, 0.95, 0.92, 0.88, 0.65, 0.45, 0.3, 0.25, 0.2];

  return (
    <div>
      <TranscriptionText
        text={text}
        wordConfidences={confidences}
        showConfidence={true}
        animationMode="instant"
        fontSize={18}
      />
      <div style={{ marginTop: 16 }}>
        <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
          Confidence Legend:
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: '#FFFFFF' }}>High (80%+)</span>
          <span style={{ color: '#F59E0B' }}>Medium (50-80%)</span>
          <span style={{ color: '#EF4444' }}>Low (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}

export const ConfidenceHighlighting: Story = {
  render: () => <ConfidenceDemo />,
};
