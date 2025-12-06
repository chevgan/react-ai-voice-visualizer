import type { Meta, StoryObj } from '@storybook/react';
import { VoiceParticles } from './index';
import React from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof VoiceParticles> = {
    title: 'Components/VoiceParticles',
    component: VoiceParticles,
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
            control: { type: 'range', min: 200, max: 600, step: 50 },
        },
        particleCount: {
            control: { type: 'range', min: 50, max: 500, step: 10 },
        },
        speed: {
            control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
    args: {
        state: 'idle',
        size: 400,
        particleCount: 100,
    },
};

export const Listening: Story = {
    args: {
        state: 'listening',
        size: 400,
        volume: 0.5,
        particleCount: 150,
    },
};

export const Speaking: Story = {
    args: {
        state: 'speaking',
        size: 400,
        volume: 0.8,
        particleCount: 200,
    },
};

function LiveMicrophoneDemo() {
    const { stream, isActive, start, stop } = useMicrophoneStream();
    const { frequencyData, volume } = useAudioAnalyser(stream);

    return (
        <div style={{ textAlign: 'center' }}>
            <VoiceParticles
                state={isActive ? 'listening' : 'idle'}
                size={500}
                audioData={isActive ? frequencyData : undefined}
                volume={volume}
                onClick={() => (isActive ? stop() : start())}
            />
            <p style={{ color: '#9CA3AF', marginTop: 16 }}>
                Click to {isActive ? 'stop' : 'start'} microphone
            </p>
        </div>
    );
}

export const LiveMicrophone: Story = {
    render: () => <LiveMicrophoneDemo />,
};
