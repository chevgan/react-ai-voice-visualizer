import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { WaveformMiniProps } from '../../types';
import { lerp } from '../../utils/math-utils';

/**
 * WaveformMini - Mini equalizer bars
 *
 * Short vertical lines that dance like an equalizer.
 * Perfect for indicating "AI is thinking" or processing audio.
 *
 * @example
 * ```tsx
 * <WaveformMini volume={0.5} barCount={8} />
 * ```
 */
export function WaveformMini({
  audioData,
  volume = 0,
  barCount = 8,
  width = 80,
  height = 24,
  color = '#00EAFF',
  className,
  style,
}: WaveformMiniProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const smoothedVolumeRef = useRef(volume);
  const barHeightsRef = useRef<number[]>(new Array(barCount).fill(0.3));

  // Parse color to RGB
  const colorRGB = useMemo(() => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return [0, 234, 255]; // Default cyan
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }, [color]);

  // Update bar heights ref when barCount changes
  useEffect(() => {
    if (barHeightsRef.current.length !== barCount) {
      barHeightsRef.current = new Array(barCount).fill(0.3);
    }
  }, [barCount]);

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      // Set canvas size
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Smooth volume
      smoothedVolumeRef.current = lerp(smoothedVolumeRef.current, volume, 0.15);

      // Calculate time
      const time = timestamp * 0.001;
      timeRef.current = time;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate bar dimensions
      const barWidth = 3;
      const gap = (width - barCount * barWidth) / (barCount + 1);
      const minHeight = height * 0.2;
      const maxHeight = height * 0.9;

      // Draw each bar
      for (let i = 0; i < barCount; i++) {
        // Calculate target height
        let targetHeight: number;

        if (audioData && audioData.length > 0) {
          // Use audio data
          const dataIndex = Math.floor((i / barCount) * audioData.length);
          targetHeight = audioData[dataIndex] / 255;
        } else {
          // Use volume + sine wave for animation
          const wavePhase = time * 3 + i * 0.6;
          const wave = (Math.sin(wavePhase) + 1) / 2;
          targetHeight = 0.2 + wave * 0.5 * (0.3 + smoothedVolumeRef.current * 0.7);
        }

        // Smooth the bar height
        barHeightsRef.current[i] = lerp(
          barHeightsRef.current[i],
          targetHeight,
          0.25
        );

        const barHeight =
          minHeight + (maxHeight - minHeight) * barHeightsRef.current[i];
        const x = gap + i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Draw glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 * (0.5 + smoothedVolumeRef.current * 0.5);

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(
          0,
          `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 0.9)`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 1)`
        );
        gradient.addColorStop(
          1,
          `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 0.9)`
        );

        ctx.fillStyle = gradient;

        // Draw rounded rectangle
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(
          x + barWidth,
          y + barHeight,
          x + barWidth - radius,
          y + barHeight
        );
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    },
    [width, height, barCount, volume, color, colorRGB, audioData]
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
      width,
      height,
      ...style,
    }),
    [width, height, style]
  );

  return (
    <div className={className} style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
        }}
      />
    </div>
  );
}
