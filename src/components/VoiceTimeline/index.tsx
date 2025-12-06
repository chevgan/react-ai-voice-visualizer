import React, { useRef, useCallback, useMemo, useState } from 'react';
import type { VoiceTimelineProps } from '../../types';

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * VoiceTimeline - Interactive audio timeline with speech segments
 *
 * Displays an audio timeline with waveform visualization, speech segments,
 * markers, and playhead. Supports seeking and playback control.
 */
export function VoiceTimeline({
  duration,
  currentTime = 0,
  segments = [],
  markers = [],
  waveformData,
  isPlaying = false,
  onSeek,
  onPlayPause,
  width = '100%',
  height = 64,
  showTimeLabels = true,
  showPlayhead = true,
  seekable = true,
  segmentColor = '#8B5CF6',
  playheadColor = '#FFFFFF',
  backgroundColor = '#1F2937',
  waveformColor = '#374151',
  progressColor = '#8B5CF6',
  labelColor = '#9CA3AF',
  className,
  style,
}: VoiceTimelineProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle click to seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!seekable || !onSeek || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const time = percent * duration;

      onSeek(Math.max(0, Math.min(duration, time)));
    },
    [seekable, onSeek, duration]
  );

  // Handle mouse move for hover preview
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;

      setHoverPosition(x);
      setHoverTime(percent * duration);
    },
    [duration]
  );

  // Container styles
  const containerStyle = useMemo(
    () => ({
      width,
      fontFamily: 'system-ui, sans-serif',
      userSelect: 'none' as const,
      ...style,
    }),
    [width, style]
  );

  // Timeline bar styles
  const timelineStyle = useMemo(
    () => ({
      position: 'relative' as const,
      height,
      backgroundColor,
      borderRadius: 4,
      overflow: 'hidden' as const,
      cursor: seekable ? 'pointer' : 'default',
    }),
    [height, backgroundColor, seekable]
  );

  // Render waveform bars
  const renderWaveform = useCallback(() => {
    if (!waveformData || waveformData.length === 0) return null;

    const barWidth = 2;
    const barGap = 1;
    const totalWidth = (barWidth + barGap) * waveformData.length;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
      >
        {waveformData.map((value, index) => {
          const barHeight = Math.max(2, value * height * 0.8);
          const x = index * (barWidth + barGap);
          const y = (height - barHeight) / 2;
          const percent = (index / waveformData.length) * 100;
          const isPlayed = percent <= progressPercent;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={1}
              fill={isPlayed ? progressColor : waveformColor}
              style={{ transition: 'fill 0.1s ease' }}
            />
          );
        })}
      </svg>
    );
  }, [waveformData, height, progressPercent, progressColor, waveformColor]);

  // Render speech segments
  const renderSegments = useCallback(() => {
    return segments.map((segment, index) => {
      const startPercent = (segment.start / duration) * 100;
      const widthPercent = ((segment.end - segment.start) / duration) * 100;

      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${startPercent}%`,
            width: `${widthPercent}%`,
            top: 0,
            bottom: 0,
            backgroundColor: segment.color || segmentColor,
            opacity: 0.3,
            borderRadius: 2,
          }}
          title={segment.label}
        />
      );
    });
  }, [segments, duration, segmentColor]);

  // Render markers
  const renderMarkers = useCallback(() => {
    return markers.map((marker, index) => {
      const positionPercent = (marker.time / duration) * 100;

      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${positionPercent}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: marker.color || '#F59E0B',
            transform: 'translateX(-50%)',
          }}
          title={marker.label || formatTime(marker.time)}
        />
      );
    });
  }, [markers, duration]);

  // Render playhead
  const renderPlayhead = useCallback(() => {
    if (!showPlayhead) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: `${progressPercent}%`,
          top: -2,
          bottom: -2,
          width: 3,
          backgroundColor: playheadColor,
          borderRadius: 2,
          transform: 'translateX(-50%)',
          boxShadow: `0 0 8px ${playheadColor}80`,
          transition: isPlaying ? 'none' : 'left 0.1s ease',
          zIndex: 10,
        }}
      >
        {/* Playhead handle */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            backgroundColor: playheadColor,
            borderRadius: '50%',
            boxShadow: `0 0 4px ${playheadColor}80`,
          }}
        />
      </div>
    );
  }, [showPlayhead, progressPercent, playheadColor, isPlaying]);

  // Render hover preview
  const renderHoverPreview = useCallback(() => {
    if (!isHovering || !seekable) return null;

    return (
      <>
        {/* Hover line */}
        <div
          style={{
            position: 'absolute',
            left: hoverPosition,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: `${playheadColor}60`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
        {/* Hover time tooltip */}
        <div
          style={{
            position: 'absolute',
            left: hoverPosition,
            top: -28,
            transform: 'translateX(-50%)',
            backgroundColor: '#0a0a0f',
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {formatTime(hoverTime)}
        </div>
      </>
    );
  }, [isHovering, seekable, hoverPosition, hoverTime, playheadColor]);

  return (
    <div className={className} style={containerStyle}>
      {/* Time labels row */}
      {showTimeLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
            fontSize: 12,
            color: labelColor,
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}

      {/* Timeline bar */}
      <div
        ref={containerRef}
        style={timelineStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Progress background */}
        {!waveformData && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: progressColor,
              opacity: 0.3,
              transition: isPlaying ? 'none' : 'width 0.1s ease',
            }}
          />
        )}

        {/* Waveform visualization */}
        {renderWaveform()}

        {/* Speech segments */}
        {renderSegments()}

        {/* Markers */}
        {renderMarkers()}

        {/* Hover preview */}
        {renderHoverPreview()}

        {/* Playhead */}
        {renderPlayhead()}
      </div>

      {/* Play/Pause button (optional) */}
      {onPlayPause && (
        <button
          onClick={onPlayPause}
          style={{
            marginTop: 8,
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: isPlaying ? '#EF4444' : segmentColor,
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isPlaying ? (
            <>
              <span style={{ fontSize: 10 }}>■</span> Pause
            </>
          ) : (
            <>
              <span style={{ fontSize: 10 }}>▶</span> Play
            </>
          )}
        </button>
      )}
    </div>
  );
}
