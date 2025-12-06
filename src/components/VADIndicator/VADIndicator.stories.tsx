import type { Meta, StoryObj } from '@storybook/react';
import { VADIndicator } from './index';
import React, { useState, useEffect } from 'react';
import type { VADState } from '../../types';

const meta: Meta<typeof VADIndicator> = {
  title: 'Components/VADIndicator',
  component: VADIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'processing', 'speaking'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLabel: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    state: 'idle',
    size: 'md',
    showLabel: true,
  },
};

export const Listening: Story = {
  args: {
    state: 'listening',
    size: 'md',
    showLabel: true,
  },
};

export const Processing: Story = {
  args: {
    state: 'processing',
    size: 'md',
    showLabel: true,
  },
};

export const Speaking: Story = {
  args: {
    state: 'speaking',
    size: 'md',
    showLabel: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <VADIndicator state="listening" size="sm" showLabel />
      <VADIndicator state="listening" size="md" showLabel />
      <VADIndicator state="listening" size="lg" showLabel />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <VADIndicator state="idle" size="lg" showLabel />
      <VADIndicator state="listening" size="lg" showLabel />
      <VADIndicator state="processing" size="lg" showLabel />
      <VADIndicator state="speaking" size="lg" showLabel />
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <VADIndicator
        state="idle"
        size="lg"
        showLabel
        colors={{
          idle: '#EC4899',
          listening: '#8B5CF6',
          processing: '#3B82F6',
          speaking: '#22C55E',
        }}
      />
      <VADIndicator
        state="listening"
        size="lg"
        showLabel
        colors={{
          idle: '#EC4899',
          listening: '#8B5CF6',
          processing: '#3B82F6',
          speaking: '#22C55E',
        }}
      />
    </div>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <VADIndicator
      state="listening"
      size="lg"
      showLabel
      labels={{
        idle: 'Tap to start',
        listening: 'I\'m listening...',
        processing: 'Thinking...',
        speaking: 'Responding',
      }}
    />
  ),
};

// Interactive demo that cycles through states
function CyclingDemo() {
  const states: VADState[] = ['idle', 'listening', 'processing', 'speaking'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % states.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <VADIndicator state={states[index]} size="lg" showLabel />
      <p style={{ marginTop: '16px', color: '#9CA3AF', fontSize: '14px' }}>
        Cycling through states every 2 seconds
      </p>
    </div>
  );
}

export const AutoCycling: Story = {
  render: () => <CyclingDemo />,
};

export const WithoutLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <VADIndicator state="idle" size="lg" />
      <VADIndicator state="listening" size="lg" />
      <VADIndicator state="processing" size="lg" />
      <VADIndicator state="speaking" size="lg" />
    </div>
  ),
};
