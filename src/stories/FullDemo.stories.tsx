import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { VoiceOrb } from '../components/VoiceOrb';
import { Waveform } from '../components/Waveform';
import { AudioReactiveMesh } from '../components/AudioReactiveMesh';
import { VADIndicator } from '../components/VADIndicator';
import { useMicrophoneStream } from '../hooks/useMicrophoneStream';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { useVoiceActivity } from '../hooks/useVoiceActivity';
import type { VoiceState, VADState } from '../types';

const meta: Meta = {
  title: 'Demos/Full Demo',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj;

// Talk to AI interface mockup
function TalkToAIDemo() {
  const { stream, isActive, error, start, stop } = useMicrophoneStream();
  const { frequencyData, timeDomainData, volume } = useAudioAnalyser(stream);
  const { isSpeaking, silenceDuration } = useVoiceActivity(volume, {
    volumeThreshold: 0.08,
    silenceThreshold: 1500,
  });

  const [aiState, setAIState] = useState<VoiceState>('idle');
  const [message, setMessage] = useState('Tap the orb to start');
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle state transitions based on voice activity
  useEffect(() => {
    if (!isActive) {
      setAIState('idle');
      setMessage('Tap the orb to start');
      return;
    }

    if (isSpeaking) {
      setAIState('listening');
      setMessage('I\'m listening...');

      // Clear any pending processing
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
    } else if (silenceDuration > 1500 && aiState === 'listening') {
      // User stopped speaking, start "processing"
      setAIState('thinking');
      setMessage('Let me think about that...');

      // Simulate AI response after processing
      const timeout = setTimeout(() => {
        setAIState('speaking');
        setMessage('Here\'s what I found...');

        // Return to listening after "speaking"
        setTimeout(() => {
          if (isActive) {
            setAIState('listening');
            setMessage('I\'m listening...');
          }
        }, 3000);
      }, 2000);

      setProcessingTimeout(timeout);
    }

    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [isActive, isSpeaking, silenceDuration, aiState]);

  const handleOrbClick = () => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  };

  const getVADState = (): VADState => {
    if (!isActive) return 'idle';
    if (aiState === 'thinking') return 'processing';
    if (aiState === 'speaking') return 'speaking';
    return 'listening';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1
        style={{
          color: '#E5E7EB',
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Talk to AI
      </h1>
      <p style={{ color: '#9CA3AF', marginBottom: 40, fontSize: 16 }}>
        Voice-powered assistant demo
      </p>

      <VoiceOrb
        state={aiState}
        size={280}
        audioData={isActive ? frequencyData : undefined}
        volume={volume}
        onClick={handleOrbClick}
        primaryColor="#8B5CF6"
        secondaryColor="#EC4899"
        glowIntensity={0.7}
      />

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <VADIndicator state={getVADState()} size="lg" showLabel />
      </div>

      <p
        style={{
          color: '#E5E7EB',
          fontSize: 20,
          marginTop: 24,
          minHeight: 30,
        }}
      >
        {message}
      </p>

      {error && (
        <p style={{ color: '#EF4444', marginTop: 16, fontSize: 14 }}>
          {error.message}
        </p>
      )}

      <div style={{ marginTop: 48, width: '100%', maxWidth: 400 }}>
        <Waveform
          timeDomainData={isActive ? timeDomainData : undefined}
          height={60}
          color="#8B5CF6"
          barWidth={3}
          barGap={2}
        />
      </div>

      <p style={{ color: '#6B7280', marginTop: 32, fontSize: 12 }}>
        {isActive ? 'Click orb to stop' : 'Click orb to start'} •{' '}
        Volume: {(volume * 100).toFixed(0)}%
      </p>
    </div>
  );
}

export const TalkToAI: Story = {
  render: () => <TalkToAIDemo />,
};

// Cyberpunk dashboard
function CyberpunkDashboardDemo() {
  const { stream, isActive, start, stop } = useMicrophoneStream();
  const { frequencyData, volume } = useAudioAnalyser(stream);
  const [simulatedVolume, setSimulatedVolume] = useState(0);

  // Simulate volume when microphone is not active
  useEffect(() => {
    if (isActive) return;

    const interval = setInterval(() => {
      setSimulatedVolume(0.1 + Math.random() * 0.4);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const activeVolume = isActive ? volume : simulatedVolume;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        padding: 40,
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              color: '#00FFFF',
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: 4,
            }}
          >
            AUDIO VISUALIZATION
          </h1>
          <button
            onClick={() => (isActive ? stop() : start())}
            style={{
              padding: '10px 24px',
              background: isActive ? '#FF0080' : '#00FFFF',
              color: '#0a0a0f',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 12,
              letterSpacing: 2,
            }}
          >
            {isActive ? 'STOP MIC' : 'START MIC'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}
        >
          <div
            style={{
              background: 'rgba(0, 255, 255, 0.05)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              padding: 24,
            }}
          >
            <h2
              style={{
                color: '#00FFFF',
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 24,
              }}
            >
              VOICE ORB
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <VoiceOrb
                state="listening"
                size={200}
                audioData={isActive ? frequencyData : undefined}
                volume={activeVolume}
                primaryColor="#00FFFF"
                secondaryColor="#FF0080"
              />
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 0, 128, 0.05)',
              border: '1px solid rgba(255, 0, 128, 0.2)',
              padding: 24,
            }}
          >
            <h2
              style={{
                color: '#FF0080',
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 24,
              }}
            >
              STATUS
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
              }}
            >
              <VADIndicator
                state={isActive ? 'listening' : 'idle'}
                size="lg"
                showLabel
                colors={{
                  idle: '#6B7280',
                  listening: '#00FFFF',
                  processing: '#FF0080',
                  speaking: '#00FF00',
                }}
              />
              <div style={{ color: '#9CA3AF', fontSize: 14 }}>
                VOLUME: {(activeVolume * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            padding: 24,
          }}
        >
          <h2
            style={{
              color: '#00FFFF',
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 24,
            }}
          >
            TERRAIN MESH
          </h2>
          <AudioReactiveMesh
            audioData={isActive ? frequencyData : undefined}
            volume={activeVolume}
            height={250}
            rows={30}
            cols={50}
            color="#00FFFF"
            perspective={70}
            waveHeight={1.5}
          />
        </div>

        <div
          style={{
            marginTop: 32,
            background: 'rgba(255, 0, 128, 0.05)',
            border: '1px solid rgba(255, 0, 128, 0.2)',
            padding: 24,
          }}
        >
          <h2
            style={{
              color: '#FF0080',
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 24,
            }}
          >
            WAVEFORM
          </h2>
          <Waveform
            timeDomainData={
              isActive
                ? new Uint8Array(128).map(() => 128 + (Math.random() - 0.5) * activeVolume * 200)
                : undefined
            }
            height={80}
            color="#FF0080"
            barWidth={4}
            barGap={2}
          />
        </div>
      </div>
    </div>
  );
}

export const CyberpunkDashboard: Story = {
  render: () => <CyberpunkDashboardDemo />,
};

// All components showcase
function ShowcaseDemo() {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVolume(0.2 + Math.random() * 0.5);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
        padding: 60,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1
          style={{
            color: '#E5E7EB',
            fontSize: 36,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          react-voice-ui
        </h1>
        <p
          style={{
            color: '#9CA3AF',
            textAlign: 'center',
            fontSize: 18,
            marginBottom: 60,
          }}
        >
          Beautiful voice interface components for React
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 40,
          }}
        >
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#E5E7EB', marginBottom: 24 }}>VoiceOrb</h2>
            <VoiceOrb state="listening" size={180} volume={volume} />
          </div>

          <div
            style={{
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#E5E7EB', marginBottom: 24 }}>VADIndicator</h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                alignItems: 'center',
                justifyContent: 'center',
                height: 180,
              }}
            >
              <VADIndicator state="idle" size="lg" showLabel />
              <VADIndicator state="listening" size="lg" showLabel />
              <VADIndicator state="processing" size="lg" showLabel />
              <VADIndicator state="speaking" size="lg" showLabel />
            </div>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 16,
              padding: 32,
              gridColumn: 'span 2',
            }}
          >
            <h2 style={{ color: '#E5E7EB', marginBottom: 24, textAlign: 'center' }}>
              Waveform
            </h2>
            <Waveform
              staticData={Array.from({ length: 50 }, () => 0.2 + Math.random() * 0.6)}
              height={60}
              color="#10B981"
              progress={0.4}
              progressColor="#8B5CF6"
            />
          </div>

          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: 16,
              padding: 32,
              gridColumn: 'span 2',
            }}
          >
            <h2 style={{ color: '#E5E7EB', marginBottom: 24, textAlign: 'center' }}>
              AudioReactiveMesh
            </h2>
            <AudioReactiveMesh
              volume={volume}
              height={200}
              color="#3B82F6"
              rows={20}
              cols={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Showcase: Story = {
  render: () => <ShowcaseDemo />,
};
