import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { WaveformProps } from '../../types';
import { lerp } from '../../utils/math-utils';
import { downsample } from '../../utils/audio-utils';

/**
 * Waveform - Audio waveform visualization component
 *
 * Displays audio data as a series of animated bars, similar to voice message
 * visualizations in messaging apps.
 *
 * @example
 * ```tsx
 * // Real-time visualization
 * const { timeDomainData } = useAudioAnalyser(stream);
 * <Waveform timeDomainData={timeDomainData} height={48} />
 *
 * // Static with playback progress
 * <Waveform staticData={waveformData} progress={0.5} />
 * ```
 */
export function Waveform({
  timeDomainData,
  staticData,
  progress = 0,
  width = '100%',
  height = 48,
  barWidth = 3,
  barGap = 2,
  barRadius = 2,
  color = '#8B5CF6',
  progressColor,
  backgroundColor = 'transparent',
  animated = true,
  className,
  style,
}: WaveformProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousHeightsRef = useRef<number[]>([]);

  // Calculate number of bars based on container width
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

  const numBars = useMemo(() => {
    if (canvasWidth === 0) return 0;
    return Math.floor(canvasWidth / (barWidth + barGap));
  }, [canvasWidth, barWidth, barGap]);

  // Convert audio data to bar heights
  const getBarHeights = useCallback((): number[] => {
    if (numBars === 0) return [];

    if (staticData) {
      // Use static data
      return downsample(staticData, numBars);
    }

    if (timeDomainData) {
      // Convert time domain data to amplitudes
      const heights: number[] = [];
      const blockSize = Math.floor(timeDomainData.length / numBars);

      for (let i = 0; i < numBars; i++) {
        let sum = 0;
        const start = i * blockSize;
        const end = Math.min(start + blockSize, timeDomainData.length);

        for (let j = start; j < end; j++) {
          // Time domain data is centered at 128
          const amplitude = Math.abs(timeDomainData[j] - 128) / 128;
          sum += amplitude;
        }

        heights.push(sum / (end - start));
      }

      return heights;
    }

    // Return flat line if no data
    return new Array(numBars).fill(0.1);
  }, [numBars, staticData, timeDomainData]);

  // Draw waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvasWidth;
    const displayHeight = height;

    // Set canvas size with DPR scaling
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    if (numBars === 0) return;

    // Get current bar heights
    const targetHeights = getBarHeights();

    // Smooth transition from previous heights
    let currentHeights: number[];
    if (animated && previousHeightsRef.current.length === targetHeights.length) {
      currentHeights = targetHeights.map((target, i) => {
        const prev = previousHeightsRef.current[i];
        return lerp(prev, target, 0.3);
      });
    } else {
      currentHeights = targetHeights;
    }
    previousHeightsRef.current = currentHeights;

    // Calculate progress bar index
    const progressIndex = Math.floor(progress * numBars);

    // Draw bars
    const maxBarHeight = displayHeight * 0.9;
    const minBarHeight = displayHeight * 0.1;
    const centerY = displayHeight / 2;

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + barGap) + barGap / 2;
      const amplitude = currentHeights[i] || 0.1;
      const barHeight = Math.max(
        minBarHeight,
        Math.min(maxBarHeight, amplitude * maxBarHeight)
      );

      // Determine color based on progress
      const isPlayed = progressColor && i < progressIndex;
      ctx.fillStyle = isPlayed ? progressColor : color;

      // Draw rounded rectangle
      const y = centerY - barHeight / 2;
      drawRoundedRect(ctx, x, y, barWidth, barHeight, barRadius);
    }
  }, [
    canvasWidth,
    height,
    numBars,
    barWidth,
    barGap,
    barRadius,
    color,
    progressColor,
    backgroundColor,
    progress,
    animated,
    getBarHeights,
  ]);

  // Animation loop for real-time data OR static redraw
  useEffect(() => {
    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timeDomainData) {
      // Real-time mode - continuous updates
      const animate = () => {
        draw();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      // Static mode - just draw once
      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [timeDomainData, staticData, progress, draw]);

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      width,
      height,
      display: 'block',
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

/**
 * Draws a rounded rectangle on a canvas context
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
