import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { AudioReactiveMeshProps } from '../../types';
import { lerp, degToRad, mapRange } from '../../utils/math-utils';
import { getFrequencyBands } from '../../utils/audio-utils';

/**
 * AudioReactiveMesh - A grid/terrain that creates waves from voice
 *
 * Creates a cyberpunk-aesthetic wireframe mesh that responds to audio input,
 * perfect for futuristic voice interface designs.
 *
 * @example
 * ```tsx
 * const { frequencyData, volume } = useAudioAnalyser(stream);
 *
 * <AudioReactiveMesh
 *   audioData={frequencyData}
 *   volume={volume}
 *   rows={20}
 *   cols={30}
 *   perspective={60}
 * />
 * ```
 */
export function AudioReactiveMesh({
  audioData,
  volume = 0,
  rows = 20,
  cols = 30,
  width = '100%',
  height = 200,
  color = '#8B5CF6',
  lineWidth = 1,
  perspective = 60,
  waveSpeed = 1,
  waveHeight = 1,
  className,
  style,
}: AudioReactiveMeshProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Smoothed values
  const smoothedRef = useRef({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = React.useState(0);

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Parse color to RGB
  const parseColor = useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [139, 92, 246];
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }, []);

  const colorRGB = useMemo(() => parseColor(color), [color, parseColor]);

  // Cache grid points to avoid GC pressure
  const pointsCacheRef = useRef<{ x: number; y: number; z: number }[][]>([]);

  // Main draw function
  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas || canvasWidth === 0) {
        // Don't schedule animation frame when canvas not ready
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvasWidth;
      const displayHeight = height;

      // Set canvas size
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.scale(dpr, dpr);

      // Calculate delta time
      const deltaTime = timestamp - (timeRef.current || timestamp);
      timeRef.current = timestamp;

      // Smooth audio values
      const smoothFactor = 1 - Math.pow(0.1, deltaTime / 16.67);
      const smoothed = smoothedRef.current;

      const bands = audioData ? getFrequencyBands(audioData) : { bass: 0, mid: 0, treble: 0 };

      smoothed.volume = lerp(smoothed.volume, volume, smoothFactor);
      smoothed.bass = lerp(smoothed.bass, bands.bass, smoothFactor);
      smoothed.mid = lerp(smoothed.mid, bands.mid, smoothFactor);
      smoothed.treble = lerp(smoothed.treble, bands.treble, smoothFactor);

      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Time for animation
      const time = timestamp * 0.001 * waveSpeed;

      // Grid parameters
      const cellWidth = displayWidth / (cols - 1);
      const cellHeight = displayHeight / (rows - 1);
      const perspectiveRad = degToRad(perspective);
      const cosP = Math.cos(perspectiveRad);
      const sinP = Math.sin(perspectiveRad);

      // Generate grid points with heights (reuse cached array)
      const points = pointsCacheRef.current;

      // Initialize or resize cache if needed
      if (points.length !== rows) {
        points.length = rows;
        for (let r = 0; r < rows; r++) {
          if (!points[r] || points[r].length !== cols) {
            points[r] = new Array(cols);
            for (let c = 0; c < cols; c++) {
              points[r][c] = { x: 0, y: 0, z: 0 };
            }
          }
        }
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellWidth;
          const baseY = row * cellHeight;

          // Calculate Z height (wave effect)
          const normalizedRow = row / rows;
          const normalizedCol = col / cols;

          // Base sine wave
          let z = Math.sin(normalizedCol * Math.PI * 4 + time) * 15;
          z += Math.sin(normalizedRow * Math.PI * 2 + time * 0.7) * 10;

          // Audio reactivity
          // Map frequency bands across the grid
          const freqIndex = Math.floor(normalizedCol * 3);
          let audioInfluence = 0;

          if (freqIndex === 0) {
            audioInfluence = smoothed.bass * 40;
          } else if (freqIndex === 1) {
            audioInfluence = smoothed.mid * 30;
          } else {
            audioInfluence = smoothed.treble * 25;
          }

          // Add volume-based ripple from center
          const centerX = 0.5;
          const centerY = 0.5;
          const distFromCenter = Math.sqrt(
            Math.pow(normalizedCol - centerX, 2) + Math.pow(normalizedRow - centerY, 2)
          );
          const ripple = Math.sin(distFromCenter * 10 - time * 3) * smoothed.volume * 20;

          z += audioInfluence + ripple;
          z *= waveHeight;

          // Apply perspective transformation
          const projectedY = baseY * cosP - z * sinP;

          // Update existing object instead of creating new one
          const point = points[row][col];
          point.x = x;
          point.y = projectedY;
          point.z = z;
        }
      }

      // Draw grid lines
      ctx.lineWidth = lineWidth;

      // Draw horizontal lines
      for (let row = 0; row < rows; row++) {
        ctx.beginPath();

        for (let col = 0; col < cols; col++) {
          const point = points[row][col];

          // Calculate color based on depth (z) for gradient effect
          const depthFactor = mapRange(point.z, -50 * waveHeight, 50 * waveHeight, 0.3, 1);
          const alpha = mapRange(row, 0, rows - 1, 0.2, 1); // Fade with distance

          ctx.strokeStyle = `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, ${alpha * depthFactor})`;

          if (col === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }

        ctx.stroke();
      }

      // Draw vertical lines
      for (let col = 0; col < cols; col++) {
        ctx.beginPath();

        for (let row = 0; row < rows; row++) {
          const point = points[row][col];

          const depthFactor = mapRange(point.z, -50 * waveHeight, 50 * waveHeight, 0.3, 1);
          const alpha = mapRange(row, 0, rows - 1, 0.2, 1);

          ctx.strokeStyle = `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, ${alpha * depthFactor})`;

          if (row === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }

        ctx.stroke();
      }

      // Add glow effect for high points
      const glowPoints: { x: number; y: number; intensity: number }[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const point = points[row][col];
          if (point.z > 20 * waveHeight) {
            const intensity = mapRange(point.z, 20 * waveHeight, 50 * waveHeight, 0, 1);
            glowPoints.push({ x: point.x, y: point.y, intensity: Math.min(1, intensity) });
          }
        }
      }

      // Draw glow points
      for (const gp of glowPoints) {
        const gradient = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, 10);
        gradient.addColorStop(0, `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, ${gp.intensity * 0.5})`);
        gradient.addColorStop(1, `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [
      canvasWidth,
      height,
      rows,
      cols,
      audioData,
      volume,
      color,
      colorRGB,
      lineWidth,
      perspective,
      waveSpeed,
      waveHeight,
    ]
  );

  // Start animation loop
  useEffect(() => {
    if (canvasWidth === 0) return;

    const animate = (timestamp: number) => {
      draw(timestamp);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [draw, canvasWidth]);

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      width,
      height,
      display: 'block',
      overflow: 'hidden',
      ...style,
    }),
    [width, height, style]
  );

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
