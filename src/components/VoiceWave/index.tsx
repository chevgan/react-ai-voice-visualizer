import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { VoiceOrbProps } from '../../types';
import { lerp } from '../../utils/math-utils';
import { getFrequencyBands } from '../../utils/audio-utils';

export interface VoiceWaveProps extends Omit<VoiceOrbProps, 'primaryColor' | 'secondaryColor' | 'glowColor'> {
    lineColor?: string;
    lineWidth?: number;
    numberOfLines?: number;
    phaseShift?: number;
    amplitude?: number;
    speed?: number;
}

/**
 * VoiceWave - A sleek, futuristic waveform visualization
 *
 * Renders multiple sine waves that phase and dance based on audio input.
 * Inspired by Siri and Gemini interfaces.
 */
export function VoiceWave({
    audioData,
    volume = 0,
    state = 'idle',
    size = 300,
    lineColor = '#FFFFFF',
    lineWidth = 2,
    numberOfLines = 5,
    phaseShift = 0.15,
    amplitude = 1,
    speed = 1,
    onClick,
    className,
    style,
}: VoiceWaveProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const smoothedRef = useRef({
        volume: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        phase: 0,
    });

    // Main draw function
    const draw = useCallback(
        (timestamp: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            // Canvas dimensions
            const width = size;
            const height = size * 0.5; // Aspect ratio 2:1 for wave

            if (canvas.width !== width * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                ctx.scale(dpr, dpr);
            }

            // Calculate delta time
            const deltaTime = timestamp - timeRef.current;
            timeRef.current = timestamp;

            // Smooth values
            const smoothFactor = 0.1;
            const smoothed = smoothedRef.current;
            const bands = audioData ? getFrequencyBands(audioData) : { bass: 0, mid: 0, treble: 0 };

            smoothed.volume = lerp(smoothed.volume, volume, smoothFactor);
            smoothed.bass = lerp(smoothed.bass, bands.bass, smoothFactor);
            smoothed.mid = lerp(smoothed.mid, bands.mid, smoothFactor);
            smoothed.treble = lerp(smoothed.treble, bands.treble, smoothFactor);

            // Speed varies by state
            let currentSpeed = speed;
            if (state === 'listening') currentSpeed *= 1.5;
            if (state === 'thinking') currentSpeed *= 3;
            if (state === 'speaking') currentSpeed *= 1.2;
            if (state === 'idle') currentSpeed *= 0.5;

            smoothed.phase += currentSpeed * deltaTime * 0.002;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw lines
            const centerY = height / 2;
            const maxAmplitude = height * 0.4 * amplitude;

            // Global alpha based on state
            ctx.globalAlpha = state === 'idle' ? 0.5 : 1;

            // Blend mode for glowing effect
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < numberOfLines; i++) {
                ctx.beginPath();
                ctx.lineWidth = lineWidth;

                // Calculate line color opacity
                const progress = i / (numberOfLines - 1);
                const alpha = 1 - Math.abs(progress - 0.5) * 1.5; // Fade out edges

                // Dynamic color (can be enhanced with gradients)
                ctx.strokeStyle = lineColor;
                ctx.globalAlpha = alpha * (state === 'idle' ? 0.3 : 0.8);

                const linePhase = smoothed.phase + i * phaseShift;

                // Draw sine wave
                for (let x = 0; x <= width; x += 5) {
                    const normalizedX = (x / width) * 2 - 1; // -1 to 1

                    // Window function to taper ends (Hanning window-ish)
                    const window = 1 - Math.pow(normalizedX, 2);

                    // Wave calculation
                    // Base wave
                    let y = Math.sin(x * 0.02 + linePhase) * maxAmplitude * 0.5;

                    // Add complexity based on audio
                    if (state !== 'idle') {
                        y += Math.sin(x * 0.05 - linePhase * 2) * maxAmplitude * 0.3 * smoothed.bass;
                        y += Math.sin(x * 0.1 + linePhase * 3) * maxAmplitude * 0.2 * smoothed.mid;
                    }

                    // Apply window and volume scaling
                    const volumeScale = state === 'idle' ? 0.2 : Math.max(0.2, smoothed.volume * 2);
                    y *= window * volumeScale;

                    if (x === 0) ctx.moveTo(x, centerY + y);
                    else ctx.lineTo(x, centerY + y);
                }

                ctx.stroke();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            animationFrameRef.current = requestAnimationFrame(draw);
        },
        [size, state, audioData, volume, speed, amplitude, numberOfLines, phaseShift, lineColor, lineWidth]
    );

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [draw]);

    const containerStyle: React.CSSProperties = useMemo(
        () => ({
            display: 'inline-block',
            cursor: onClick ? 'pointer' : 'default',
            ...style,
        }),
        [onClick, style]
    );

    return (
        <div className={className} style={containerStyle} onClick={onClick}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}
