import React, { useMemo } from 'react';
import type { SpeechConfidenceBarProps, ConfidenceLevel } from '../../types';

/**
 * Get confidence level based on value and thresholds
 */
function getConfidenceLevel(
  confidence: number,
  mediumThreshold: number,
  highThreshold: number
): ConfidenceLevel {
  if (confidence >= highThreshold) return 'high';
  if (confidence >= mediumThreshold) return 'medium';
  return 'low';
}

/**
 * Get color based on confidence level
 */
function getConfidenceColor(
  level: ConfidenceLevel,
  lowColor: string,
  mediumColor: string,
  highColor: string
): string {
  switch (level) {
    case 'high':
      return highColor;
    case 'medium':
      return mediumColor;
    case 'low':
    default:
      return lowColor;
  }
}

/**
 * SpeechConfidenceBar - Visual indicator for speech recognition confidence
 *
 * Displays a progress bar that changes color based on confidence level.
 * Perfect for showing how confident the AI is in its transcription.
 */
export function SpeechConfidenceBar({
  confidence,
  showLabel = true,
  showLevelText = false,
  levelLabels = {},
  width = 200,
  height = 8,
  animated = true,
  showGlow = true,
  lowColor = '#EF4444',
  mediumColor = '#F59E0B',
  highColor = '#10B981',
  backgroundColor = '#374151',
  labelColor = '#9CA3AF',
  fontSize = 12,
  mediumThreshold = 0.5,
  highThreshold = 0.8,
  className,
  style,
}: SpeechConfidenceBarProps): React.ReactElement {
  // Clamp confidence to 0-1
  const clampedConfidence = Math.max(0, Math.min(1, confidence));

  // Get level and color
  const level = getConfidenceLevel(
    clampedConfidence,
    mediumThreshold,
    highThreshold
  );
  const barColor = getConfidenceColor(level, lowColor, mediumColor, highColor);

  // Default level labels
  const defaultLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };
  const mergedLabels = { ...defaultLabels, ...levelLabels };

  // Container styles
  const containerStyle = useMemo(
    () => ({
      display: 'inline-flex',
      flexDirection: 'column' as const,
      gap: 4,
      fontFamily: 'system-ui, sans-serif',
      ...style,
    }),
    [style]
  );

  // Bar container styles
  const barContainerStyle = useMemo(
    () => ({
      width,
      height,
      backgroundColor,
      borderRadius: height / 2,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    }),
    [width, height, backgroundColor]
  );

  // Progress bar styles
  const progressStyle = useMemo(
    () => ({
      width: `${clampedConfidence * 100}%`,
      height: '100%',
      backgroundColor: barColor,
      borderRadius: height / 2,
      transition: animated ? 'width 0.3s ease, background-color 0.3s ease' : 'none',
      boxShadow:
        showGlow && level === 'high'
          ? `0 0 8px ${barColor}, 0 0 16px ${barColor}40`
          : 'none',
    }),
    [clampedConfidence, barColor, height, animated, showGlow, level]
  );

  // Label container styles
  const labelContainerStyle = useMemo(
    () => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width,
    }),
    [width]
  );

  // Label text styles
  const labelStyle = useMemo(
    () => ({
      fontSize,
      color: labelColor,
      fontWeight: 500 as const,
      transition: animated ? 'color 0.3s ease' : 'none',
    }),
    [fontSize, labelColor, animated]
  );

  // Level indicator styles (colored text)
  const levelIndicatorStyle = useMemo(
    () => ({
      fontSize,
      color: barColor,
      fontWeight: 600 as const,
      transition: animated ? 'color 0.3s ease' : 'none',
    }),
    [fontSize, barColor, animated]
  );

  return (
    <div className={className} style={containerStyle}>
      {/* Labels row */}
      {(showLabel || showLevelText) && (
        <div style={labelContainerStyle}>
          {showLabel && (
            <span style={labelStyle}>
              {Math.round(clampedConfidence * 100)}%
            </span>
          )}
          {showLevelText && (
            <span style={levelIndicatorStyle}>{mergedLabels[level]}</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div style={barContainerStyle}>
        <div style={progressStyle} />
      </div>
    </div>
  );
}
