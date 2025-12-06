import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { VoiceOrbProps } from '../../types';
import { lerp } from '../../utils/math-utils';

export interface VoiceParticlesProps extends Omit<VoiceOrbProps, 'glowColor'> {
    particleCount?: number;
    particleSize?: number;
    speed?: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    targetX: number;
    targetY: number;
    color: string;
    alpha: number;
}

/**
 * VoiceParticles - A swarm of particles that react to voice
 *
 * Particles drift idly, swirl when listening, and pulse when speaking.
 */
export function VoiceParticles({
    audioData: _audioData,
    volume = 0,
    state = 'idle',
    size = 300,
    primaryColor = '#06B6D4',
    secondaryColor = '#8B5CF6',
    particleCount = 100,
    particleSize = 3,
    speed = 1,
    onClick,
    className,
    style,
}: VoiceParticlesProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const timeRef = useRef(0);
    const smoothedRef = useRef({ volume: 0 });

    // Store colors in ref to update without reinitializing particles
    const colorsRef = useRef({ primary: primaryColor, secondary: secondaryColor });
    colorsRef.current = { primary: primaryColor, secondary: secondaryColor };

    // Initialize particles (only when count or size changes, not colors)
    useEffect(() => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * size,
                y: Math.random() * size,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * particleSize + 1,
                targetX: size / 2,
                targetY: size / 2,
                color: Math.random() > 0.5 ? colorsRef.current.primary : colorsRef.current.secondary,
                alpha: Math.random() * 0.5 + 0.5,
            });
        }
        particlesRef.current = particles;
    }, [particleCount, size, particleSize]);

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

            // Calculate delta time for frame-rate independent animation
            const deltaTime = timestamp - timeRef.current;
            timeRef.current = timestamp;

            // Smooth volume using delta time
            const smoothFactor = 1 - Math.pow(0.1, deltaTime / 16.67);
            smoothedRef.current.volume = lerp(smoothedRef.current.volume, volume, smoothFactor);
            const vol = smoothedRef.current.volume;

            ctx.clearRect(0, 0, size, size);
            ctx.globalCompositeOperation = 'screen';

            const centerX = size / 2;
            const centerY = size / 2;

            particlesRef.current.forEach((p) => {
                // Behavior based on state
                if (state === 'idle') {
                    // Brownian motion
                    p.x += p.vx * speed * 0.5;
                    p.y += p.vy * speed * 0.5;

                    // Boundary wrap
                    if (p.x < 0) p.x = size;
                    if (p.x > size) p.x = 0;
                    if (p.y < 0) p.y = size;
                    if (p.y > size) p.y = 0;
                } else if (state === 'listening') {
                    // Swirl around center
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);

                    // Spiral in
                    const targetRadius = 50 + vol * 100;
                    const force = (dist - targetRadius) * 0.05;

                    p.vx += Math.cos(angle) * -force * 0.1;
                    p.vy += Math.sin(angle) * -force * 0.1;

                    // Rotate
                    p.vx += Math.sin(angle) * 2 * speed;
                    p.vy += -Math.cos(angle) * 2 * speed;

                    // Damping
                    p.vx *= 0.9;
                    p.vy *= 0.9;

                    p.x += p.vx;
                    p.y += p.vy;
                } else if (state === 'speaking') {
                    // Pulse outward
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);

                    const pulseForce = vol * 50 * speed;
                    const returnForce = (dist - 100) * 0.05;

                    p.vx += Math.cos(angle) * (pulseForce - returnForce) * 0.1;
                    p.vy += Math.sin(angle) * (pulseForce - returnForce) * 0.1;

                    // Damping
                    p.vx *= 0.8;
                    p.vy *= 0.8;

                    p.x += p.vx;
                    p.y += p.vy;
                } else if (state === 'thinking') {
                    // Rapid jitter/orbit
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    const angle = Math.atan2(dy, dx);

                    p.x = centerX + Math.cos(angle + 0.1 * speed) * (dx * dx + dy * dy) ** 0.5;
                    p.y = centerY + Math.sin(angle + 0.1 * speed) * (dx * dx + dy * dy) ** 0.5;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha * (0.5 + vol * 0.5);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            animationFrameRef.current = requestAnimationFrame(draw);
        },
        [size, state, volume, speed]
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
