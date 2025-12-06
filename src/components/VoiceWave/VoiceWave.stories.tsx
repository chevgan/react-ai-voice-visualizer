import type { Meta, StoryObj } from '@storybook/react';
import { VoiceWave } from './index';
import React, { useState, useEffect } from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof VoiceWave> = {
    title: 'Components/VoiceWave',
    component: VoiceWave,
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
            control: { type: 'range', min: 200, max: 800, step: 50 },
        },
        lineColor: { control: 'color' },
        speed: { control: { type: 'range', min: 0.1, max: 5, step: 0.1 } },
        amplitude: { control: { type: 'range', min: 0.1, max: 3, step: 0.1 } },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
    args: {
        state: 'idle',
        size: 400,
        lineColor: '#06B6D4',
    },
};

export const Listening: Story = {
    args: {
        state: 'listening',
        size: 400,
        volume: 0.5,
        lineColor: '#8B5CF6',
    },
};

export const Thinking: Story = {
    args: {
        state: 'thinking',
        size: 400,
        lineColor: '#EC4899',
    },
};

// Live microphone demo
function LiveMicrophoneDemo() {
    const { stream, isActive, start, stop } = useMicrophoneStream();
    const { frequencyData, volume } = useAudioAnalyser(stream);

    return (
        <div style={{ textAlign: 'center' }}>
            <VoiceWave
                state={isActive ? 'listening' : 'idle'}
                size={500}
                audioData={isActive ? frequencyData : undefined}
                volume={volume}
                onClick={() => (isActive ? stop() : start())}
                lineColor={isActive ? '#10B981' : '#6B7280'}
            />
            <p style={{ color: '#9CA3AF', marginTop: 16 }}>
                Click wave to {isActive ? 'stop' : 'start'} microphone
            </p>
        </div>
    );
}

export const LiveMicrophone: Story = {
    render: () => <LiveMicrophoneDemo />,
};
