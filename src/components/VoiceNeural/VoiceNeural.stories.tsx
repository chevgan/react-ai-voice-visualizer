import type { Meta, StoryObj } from '@storybook/react';
import { VoiceNeural } from './index';
import React from 'react';
import { useMicrophoneStream } from '../../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

const meta: Meta<typeof VoiceNeural> = {
    title: 'Components/VoiceNeural',
    component: VoiceNeural,
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
        nodeCount: {
            control: { type: 'range', min: 10, max: 100, step: 5 },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
    args: {
        state: 'idle',
        size: 400,
    },
};

export const Thinking: Story = {
    args: {
        state: 'thinking',
        size: 400,
    },
};

function LiveMicrophoneDemo() {
    const { stream, isActive, start, stop } = useMicrophoneStream();
    const { frequencyData, volume } = useAudioAnalyser(stream);

    return (
        <div style={{ textAlign: 'center' }}>
            <VoiceNeural
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
