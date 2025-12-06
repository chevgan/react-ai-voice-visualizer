import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { createNoise2D } from 'simplex-noise';
import type { VoiceOrbProps, VoiceState } from '../../types';
import { lerp } from '../../utils/math-utils';
import { getFrequencyBands } from '../../utils/audio-utils';

// Create noise function once
const noise2D = createNoise2D();

/**
 * VoiceOrb - A beautiful, fluid 3D-like sphere that reacts to voice in real-time
 *
 * The hero component of react-voice-ui, featuring organic deformation,
 * audio reactivity, and smooth state transitions.
 */
export function VoiceOrb({
  audioData,
  volume = 0,
  state = 'idle',
  size = 200,
  primaryColor = '#06B6D4', // Cyan
  secondaryColor = '#8B5CF6', // Violet
  glowIntensity = 0.6,
  noiseScale = 0.2, // Smoother default
  noiseSpeed = 0.5, // Slower default
  onClick,
  className,
  style,
}: VoiceOrbProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const stateTransitionRef = useRef(0);
  const prevStateRef = useRef<VoiceState>(state);

  // Smoothed values for animation
  const smoothedRef = useRef({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    rotation: 0,
    pulse: 0,
    colorShift: 0,
  });

  // Parse colors to RGB
  const parseColor = useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [6, 182, 212]; // Default cyan
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }, []);

  const primaryRGB = useMemo(() => parseColor(primaryColor), [primaryColor, parseColor]);
  const secondaryRGB = useMemo(() => parseColor(secondaryColor), [secondaryColor, parseColor]);

  // Get state-specific parameters
  const getStateParams = useCallback(
    (currentState: VoiceState) => {
      switch (currentState) {
        case 'idle':
          return {
            baseNoiseScale: noiseScale * 0.3,
            noiseSpeedMultiplier: 0.4,
            glowMultiplier: 0.4,
            rotationSpeed: 0.05,
            pulseSpeed: 0.5,
            audioReactivity: 0,
            colorShiftSpeed: 0.2,
          };
        case 'listening':
          return {
            baseNoiseScale: noiseScale,
            noiseSpeedMultiplier: 1,
            glowMultiplier: 1,
            rotationSpeed: 0.2,
            pulseSpeed: 1,
            audioReactivity: 1,
            colorShiftSpeed: 0.5,
          };
        case 'thinking':
          return {
            baseNoiseScale: noiseScale * 0.6,
            noiseSpeedMultiplier: 2.0,
            glowMultiplier: 1.2,
            rotationSpeed: 1.5,
            pulseSpeed: 4,
            audioReactivity: 0,
            colorShiftSpeed: 2,
          };
        case 'speaking':
          return {
            baseNoiseScale: noiseScale * 0.8,
            noiseSpeedMultiplier: 1.0,
            glowMultiplier: 1.1,
            rotationSpeed: 0.3,
            pulseSpeed: 1,
            audioReactivity: 0.8,
            colorShiftSpeed: 0.8,
          };
        default:
          return {
            baseNoiseScale: noiseScale,
            noiseSpeedMultiplier: 1,
            glowMultiplier: 1,
            rotationSpeed: 0.2,
            pulseSpeed: 1,
            audioReactivity: 1,
            colorShiftSpeed: 0.5,
          };
      }
    },
    [noiseScale]
  );

  // Main draw function
  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displaySize = size;
      const padding = size * 0.4; // More padding for larger glow
      const canvasSize = displaySize + padding * 2;

      // Set canvas size if changed
      if (canvas.width !== canvasSize * dpr) {
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        canvas.style.width = `${canvasSize}px`;
        canvas.style.height = `${canvasSize}px`;
        ctx.scale(dpr, dpr);
      }

      // Calculate delta time
      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;

      // Handle state transitions
      if (prevStateRef.current !== state) {
        stateTransitionRef.current = 0;
        prevStateRef.current = state;
      }
      stateTransitionRef.current = Math.min(1, stateTransitionRef.current + deltaTime * 0.005);

      // Get current state parameters
      const stateParams = getStateParams(state);

      // Smooth values
      const smoothFactor = 1 - Math.pow(0.05, deltaTime / 16.67); // Slower smoothing for fluid feel
      const smoothed = smoothedRef.current;

      // Get frequency bands
      const bands = audioData ? getFrequencyBands(audioData) : { bass: 0, mid: 0, treble: 0 };

      smoothed.volume = lerp(smoothed.volume, volume, smoothFactor);
      smoothed.bass = lerp(smoothed.bass, bands.bass, smoothFactor);
      smoothed.mid = lerp(smoothed.mid, bands.mid, smoothFactor);
      smoothed.treble = lerp(smoothed.treble, bands.treble, smoothFactor);
      smoothed.rotation += stateParams.rotationSpeed * deltaTime * 0.001;
      smoothed.pulse += stateParams.pulseSpeed * deltaTime * 0.001;
      smoothed.colorShift += stateParams.colorShiftSpeed * deltaTime * 0.001;

      // Clear canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      // Use composite operation for better blending
      ctx.globalCompositeOperation = 'screen';

      // Calculate center
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      const baseRadius = displaySize / 2 - 20;

      // Calculate time for noise
      const time = timestamp * 0.0005 * noiseSpeed * stateParams.noiseSpeedMultiplier;

      // Number of points to draw the sphere
      const numPoints = 128; // Higher resolution
      const points: [number, number][] = [];

      // Generate sphere points with noise deformation
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + smoothed.rotation;

        // Multi-layered noise for more organic feel
        const noise1 = noise2D(Math.cos(angle) * 1.5 + time, Math.sin(angle) * 1.5 + time);
        const noise2 = noise2D(Math.cos(angle) * 3 - time * 1.5, Math.sin(angle) * 3 + time * 0.5);

        const noiseValue = (noise1 + noise2 * 0.5) * 0.66;

        // Audio-reactive deformation
        let audioOffset = 0;
        if (stateParams.audioReactivity > 0) {
          const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const section = normalizedAngle / (Math.PI * 2);

          // Smooth transition between bands
          if (section < 0.33) {
            audioOffset = smoothed.bass * 0.4;
          } else if (section < 0.66) {
            audioOffset = smoothed.mid * 0.3;
          } else {
            audioOffset = smoothed.treble * 0.2;
          }

          audioOffset += smoothed.volume * 0.3;
          audioOffset *= stateParams.audioReactivity;
        }

        // Thinking state pulse
        let pulseOffset = 0;
        if (state === 'thinking') {
          pulseOffset = Math.sin(smoothed.pulse * 2 + angle * 3) * 0.15;
        }

        // Speaking state volume pulse
        if (state === 'speaking') {
          pulseOffset = smoothed.volume * 0.3 * Math.sin(angle * 4 + time * 3);
        }

        // Calculate final radius
        const deformation = noiseValue * stateParams.baseNoiseScale + audioOffset + pulseOffset;
        const radius = baseRadius * (1 + deformation);

        // Convert to cartesian coordinates
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        points.push([x, y]);
      }

      // Draw multiple fluid layers
      const drawLayer = (scale: number, alpha: number, colorShiftOffset: number) => {
        ctx.beginPath();
        if (points.length > 0) {
          // Scale points relative to center
          const p0x = centerX + (points[0][0] - centerX) * scale;
          const p0y = centerY + (points[0][1] - centerY) * scale;
          ctx.moveTo(p0x, p0y);

          for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const next = points[(i + 1) % points.length];
            const nextNext = points[(i + 2) % points.length];
            const prev = points[(i - 1 + points.length) % points.length];

            // Scale points
            const cx = centerX + (current[0] - centerX) * scale;
            const cy = centerY + (current[1] - centerY) * scale;
            const nx = centerX + (next[0] - centerX) * scale;
            const ny = centerY + (next[1] - centerY) * scale;
            const nnx = centerX + (nextNext[0] - centerX) * scale;
            const nny = centerY + (nextNext[1] - centerY) * scale;
            const px = centerX + (prev[0] - centerX) * scale;
            const py = centerY + (prev[1] - centerY) * scale;

            // Catmull-Rom to Bezier conversion for smoother curves
            const cp1x = cx + (nx - px) / 6;
            const cp1y = cy + (ny - py) / 6;
            const cp2x = nx - (nnx - cx) / 6;
            const cp2y = ny - (nny - cy) / 6;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nx, ny);
          }
        }
        ctx.closePath();

        // Dynamic gradient
        const gradient = ctx.createRadialGradient(
          centerX + Math.cos(smoothed.colorShift + colorShiftOffset) * baseRadius * 0.3,
          centerY + Math.sin(smoothed.colorShift + colorShiftOffset) * baseRadius * 0.3,
          0,
          centerX,
          centerY,
          baseRadius * 1.5
        );

        // Color mixing
        const mix = (Math.sin(smoothed.colorShift * 0.5 + colorShiftOffset) + 1) / 2;
        const r = lerp(primaryRGB[0], secondaryRGB[0], mix);
        const g = lerp(primaryRGB[1], secondaryRGB[1], mix);
        const b = lerp(primaryRGB[2], secondaryRGB[2], mix);

        // Add a third accent color (white/cyan mix) for the core
        const coreColor = [200, 255, 255];

        gradient.addColorStop(0, `rgba(${coreColor.join(',')}, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
        gradient.addColorStop(0.8, `rgba(${secondaryRGB.join(',')}, ${alpha * 0.2})`);
        gradient.addColorStop(1, `rgba(${primaryRGB.join(',')}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      };

      // Draw layers
      drawLayer(1.0, 0.8, 0); // Main body
      drawLayer(0.95, 0.5, 2); // Inner shifting layer
      drawLayer(1.1, 0.3, 4); // Outer glow aura

      // Extra outer glow for "atmosphere"
      const glowStrength = glowIntensity * stateParams.glowMultiplier;
      if (glowStrength > 0) {
        const glowGradient = ctx.createRadialGradient(
          centerX, centerY, baseRadius * 0.8,
          centerX, centerY, baseRadius * 2.5
        );
        glowGradient.addColorStop(0, `rgba(${primaryRGB.join(',')}, ${glowStrength * 0.2})`);
        glowGradient.addColorStop(1, `rgba(${secondaryRGB.join(',')}, 0)`);

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    },
    [
      size,
      state,
      audioData,
      volume,
      noiseSpeed,
      glowIntensity,
      primaryRGB,
      secondaryRGB,
      getStateParams,
    ]
  );

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          // Ensure canvas is crisp on high DPI displays
          width: size + (size * 0.4 * 2),
          height: size + (size * 0.4 * 2),
        }}
      />
    </div>
  );
}
