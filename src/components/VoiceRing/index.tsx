import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { VoiceOrbProps } from '../../types';
import { lerp } from '../../utils/math-utils';
import { getFrequencyBands } from '../../utils/audio-utils';

export interface VoiceRingProps extends VoiceOrbProps {
    rotationSpeed?: number;
}

/**
 * VoiceRing - A minimal, elegant ring visualization
 *
 * Idle: A thin, breathing ring.
 * Active: Ripples and subtle waveform deformations.
 */
export function VoiceRing({
    audioData,
    volume = 0,
    state = 'idle',
    size = 300,
    primaryColor = '#06B6D4',
    secondaryColor = '#8B5CF6',
    rotationSpeed: _rotationSpeed = 1,
    onClick,
    className,
    style,
}: VoiceRingProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timeRef = useRef(0);
    const ripplesRef = useRef<{ r: number; alpha: number; speed: number }[]>([]);

    const smoothedRef = useRef({
        volume: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        rotation: 0,
        breathing: 0,
    });

    const draw = useCallback(
        (timestamp: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            if (canvas.width !== size * dpr) {
                canvas.width = size * dpr;
                canvas.height = size * dpr;
                canvas.style.width = `${size}px`;
                canvas.style.height = `${size}px`;
                ctx.scale(dpr, dpr);
            }

            void (timestamp - timeRef.current);
            timeRef.current = timestamp;

            // Smooth values
            const smoothFactor = 0.1;
            const smoothed = smoothedRef.current;
            const bands = audioData ? getFrequencyBands(audioData) : { bass: 0, mid: 0, treble: 0 };

            smoothed.volume = lerp(smoothed.volume, volume, smoothFactor);
            smoothed.bass = lerp(smoothed.bass, bands.bass, smoothFactor);
            smoothed.mid = lerp(smoothed.mid, bands.mid, smoothFactor);
            smoothed.treble = lerp(smoothed.treble, bands.treble, smoothFactor);

            // Breathing effect for idle state
            smoothed.breathing = (Math.sin(timestamp * 0.002) + 1) * 0.5; // 0 to 1

            ctx.clearRect(0, 0, size, size);
            const centerX = size / 2;
            const centerY = size / 2;
            const baseRadius = size / 2 - 40;

            // Add new ripples based on volume spikes or random in idle
            if (state === 'speaking' || state === 'listening') {
                if (Math.random() < smoothed.volume * 0.5) {
                    ripplesRef.current.push({ r: baseRadius, alpha: 1, speed: 1 + Math.random() });
                }
            } else if (state === 'thinking') {
                if (Math.random() < 0.2) {
                    ripplesRef.current.push({ r: baseRadius * 0.5, alpha: 1, speed: 2 });
                }
            }

            // Update and draw ripples
            ctx.globalCompositeOperation = 'screen';

            // Filter out dead ripples
            ripplesRef.current = ripplesRef.current.filter(ripple => ripple.alpha > 0.01);

            ripplesRef.current.forEach(ripple => {
                ripple.r += ripple.speed;
                ripple.alpha *= 0.96;

                ctx.beginPath();
                ctx.arc(centerX, centerY, ripple.r, 0, Math.PI * 2);
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 1;
                ctx.globalAlpha = ripple.alpha * 0.5;
                ctx.stroke();
            });

            // Main Ring
            ctx.beginPath();

            // Deform ring if active
            const numPoints = 100;
            for (let i = 0; i <= numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                let r = baseRadius;

                if (state !== 'idle') {
                    // Waveform deformation
                    const wave = Math.sin(angle * 10 + timestamp * 0.005) * smoothed.mid * 10;
                    const wave2 = Math.cos(angle * 20 - timestamp * 0.01) * smoothed.treble * 5;
                    r += wave + wave2;
                } else {
                    // Subtle breathing
                    r += smoothed.breathing * 2;
                }

                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.closePath();

            // Glow style
            ctx.shadowBlur = 15 + smoothed.volume * 20;
            ctx.shadowColor = primaryColor;
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2 + smoothed.volume * 3;
            ctx.globalAlpha = 0.8 + smoothed.volume * 0.2;
            ctx.stroke();

            // Reset shadow
            ctx.shadowBlur = 0;

            // Inner Core (Minimal)
            if (state !== 'idle') {
                ctx.beginPath();
                ctx.arc(centerX, centerY, baseRadius * 0.3 + smoothed.bass * 20, 0, Math.PI * 2);
                ctx.fillStyle = secondaryColor;
                ctx.globalAlpha = 0.1 + smoothed.volume * 0.2;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            animationFrameRef.current = requestAnimationFrame(draw);
        },
        [size, state, volume, primaryColor, secondaryColor]
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
