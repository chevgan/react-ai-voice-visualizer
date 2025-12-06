import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { VoiceOrbProps } from '../../types';
import { lerp } from '../../utils/math-utils';

export interface VoiceNeuralProps extends Omit<VoiceOrbProps, 'glowColor'> {
    nodeCount?: number;
    connectionDistance?: number;
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulse: number;
}

/**
 * VoiceNeural - A neural network visualization
 *
 * Nodes connected by lines that pulse with activity.
 */
export function VoiceNeural({
    audioData: _audioData,
    volume = 0,
    state = 'idle',
    size = 300,
    primaryColor = '#06B6D4',
    secondaryColor = '#8B5CF6',
    nodeCount = 40,
    connectionDistance = 100,
    onClick,
    className,
    style,
}: VoiceNeuralProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const nodesRef = useRef<Node[]>([]);
    const timeRef = useRef(0);
    const smoothedRef = useRef({ volume: 0 });

    // Initialize nodes
    useEffect(() => {
        const nodes: Node[] = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * size,
                y: Math.random() * size,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                pulse: 0,
            });
        }
        nodesRef.current = nodes;
    }, [nodeCount, size]);

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

            // Smooth volume
            smoothedRef.current.volume = lerp(smoothedRef.current.volume, volume, 0.1);
            const vol = smoothedRef.current.volume;

            ctx.clearRect(0, 0, size, size);

            // Update nodes
            const speedMultiplier = state === 'idle' ? 1 : state === 'thinking' ? 3 : 2;

            nodesRef.current.forEach(node => {
                node.x += node.vx * speedMultiplier;
                node.y += node.vy * speedMultiplier;

                // Bounce off walls
                if (node.x < 0 || node.x > size) node.vx *= -1;
                if (node.y < 0 || node.y > size) node.vy *= -1;

                // Pulse decay
                node.pulse *= 0.95;

                // Random activation based on volume
                if (state !== 'idle' && Math.random() < vol * 0.1) {
                    node.pulse = 1;
                }
            });

            // Draw connections
            ctx.lineWidth = 1;
            for (let i = 0; i < nodesRef.current.length; i++) {
                const nodeA = nodesRef.current[i];
                for (let j = i + 1; j < nodesRef.current.length; j++) {
                    const nodeB = nodesRef.current[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const alpha = 1 - dist / connectionDistance;

                        // Pulse travels along line
                        const activeAlpha = Math.max(nodeA.pulse, nodeB.pulse) * alpha;

                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);

                        if (activeAlpha > 0.1) {
                            ctx.strokeStyle = secondaryColor;
                            ctx.globalAlpha = activeAlpha;
                        } else {
                            ctx.strokeStyle = primaryColor;
                            ctx.globalAlpha = alpha * 0.2;
                        }
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodesRef.current.forEach(node => {
                ctx.beginPath();
                const r = node.radius + node.pulse * 3;
                ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                ctx.fillStyle = node.pulse > 0.1 ? '#fff' : primaryColor;
                ctx.globalAlpha = 0.5 + node.pulse * 0.5;
                ctx.fill();

                // Glow
                if (node.pulse > 0.1) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r * 2, 0, Math.PI * 2);
                    ctx.fillStyle = secondaryColor;
                    ctx.globalAlpha = node.pulse * 0.3;
                    ctx.fill();
                }
            });

            ctx.globalAlpha = 1;
            animationFrameRef.current = requestAnimationFrame(draw);
        },
        [size, state, volume, primaryColor, secondaryColor, connectionDistance]
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
