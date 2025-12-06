import React, { useMemo } from 'react';
import type { VADIndicatorProps, ComponentSize, VADState } from '../../types';

const DEFAULT_COLORS: Record<VADState, string> = {
  idle: '#6B7280',
  listening: '#8B5CF6',
  processing: '#F59E0B',
  speaking: '#10B981',
};

const DEFAULT_LABELS: Record<VADState, string> = {
  idle: 'Ready',
  listening: 'Listening',
  processing: 'Processing',
  speaking: 'Speaking',
};

const SIZE_MAP: Record<ComponentSize, number> = {
  sm: 12,
  md: 16,
  lg: 24,
};

// CSS keyframes as a style element (injected once)
const KEYFRAMES = `
@keyframes vadPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes vadSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes vadWave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

@keyframes vadRing {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
`;

// Check if keyframes are already injected
let keyframesInjected = false;

function injectKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

/**
 * VADIndicator - Voice Activity Detection status indicator
 *
 * Displays the current state of voice activity with animated visual feedback.
 *
 * @example
 * ```tsx
 * <VADIndicator state="listening" size="md" showLabel />
 * ```
 */
export function VADIndicator({
  state,
  size = 'md',
  showLabel = false,
  labels,
  colors,
  className,
  style,
}: VADIndicatorProps): React.ReactElement {
  // Inject keyframes on first render
  React.useEffect(() => {
    injectKeyframes();
  }, []);

  const sizeValue = SIZE_MAP[size];
  const color = colors?.[state] ?? DEFAULT_COLORS[state];
  const label = labels?.[state] ?? DEFAULT_LABELS[state];

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: sizeValue * 0.5,
      ...style,
    }),
    [sizeValue, style]
  );

  const indicatorStyle: React.CSSProperties = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: sizeValue,
      height: sizeValue,
      borderRadius: '50%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return baseStyle;
  }, [sizeValue]);

  const labelStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: sizeValue * 0.875,
      fontWeight: 500,
      color: color,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    [sizeValue, color]
  );

  const renderIndicator = () => {
    switch (state) {
      case 'idle':
        return (
          <div
            style={{
              ...indicatorStyle,
              backgroundColor: color,
              opacity: 0.6,
            }}
          />
        );

      case 'listening':
        return (
          <div style={indicatorStyle}>
            {/* Core dot */}
            <div
              style={{
                width: sizeValue,
                height: sizeValue,
                borderRadius: '50%',
                backgroundColor: color,
                animation: 'vadPulse 1.5s ease-in-out infinite',
              }}
            />
            {/* Expanding ring */}
            <div
              style={{
                position: 'absolute',
                width: sizeValue,
                height: sizeValue,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                animation: 'vadRing 1.5s ease-out infinite',
              }}
            />
          </div>
        );

      case 'processing':
        return (
          <div style={indicatorStyle}>
            {/* Spinner */}
            <div
              style={{
                width: sizeValue,
                height: sizeValue,
                borderRadius: '50%',
                border: `2px solid transparent`,
                borderTopColor: color,
                borderRightColor: color,
                animation: 'vadSpin 0.8s linear infinite',
              }}
            />
          </div>
        );

      case 'speaking':
        return (
          <div
            style={{
              ...indicatorStyle,
              gap: sizeValue * 0.1,
            }}
          >
            {/* Sound wave bars */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: sizeValue * 0.15,
                  height: sizeValue * 0.6,
                  backgroundColor: color,
                  borderRadius: sizeValue * 0.1,
                  animation: `vadWave 0.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className} style={containerStyle}>
      {renderIndicator()}
      {showLabel && <span style={labelStyle}>{label}</span>}
    </div>
  );
}
