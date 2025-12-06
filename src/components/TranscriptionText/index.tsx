import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import type { TranscriptionTextProps } from '../../types';

/**
 * Get the end index of the next word in text starting from currentIndex
 */
function getNextWordEnd(text: string, currentIndex: number): number {
  if (currentIndex >= text.length) return text.length;

  // Skip any whitespace at current position
  let i = currentIndex;
  while (i < text.length && text[i] === ' ') {
    i++;
  }

  // Find end of word
  while (i < text.length && text[i] !== ' ') {
    i++;
  }

  return i;
}

/**
 * Split text into words while preserving spaces
 */
function splitIntoWords(text: string): string[] {
  const words: string[] = [];
  let currentWord = '';

  for (const char of text) {
    if (char === ' ') {
      if (currentWord) {
        words.push(currentWord);
        currentWord = '';
      }
      // Add space as separate entry or attach to previous
      if (words.length > 0) {
        words[words.length - 1] += ' ';
      }
    } else {
      currentWord += char;
    }
  }

  if (currentWord) {
    words.push(currentWord);
  }

  return words;
}

/**
 * Get confidence color based on value
 */
function getConfidenceColor(
  confidence: number,
  normalColor: string,
  lowConfidenceColor: string
): string {
  if (confidence >= 0.8) return normalColor;
  if (confidence >= 0.5) return lowConfidenceColor;
  return '#EF4444'; // Red for very low confidence
}

/**
 * Inject keyframes for cursor blink animation
 */
function injectKeyframes(): void {
  const styleId = 'transcription-text-keyframes';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes transcription-cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * TranscriptionText - Live transcription display with typing animation
 *
 * Displays text with a typing effect, blinking cursor, and optional
 * confidence highlighting. Perfect for real-time speech-to-text interfaces.
 */
export function TranscriptionText({
  text,
  interimText = '',
  animationMode = 'word',
  typingSpeed = 50,
  showCursor = true,
  wordConfidences,
  showConfidence = false,
  textColor = '#FFFFFF',
  interimColor = '#6B7280',
  cursorColor = '#8B5CF6',
  lowConfidenceColor = '#F59E0B',
  fontSize = 16,
  fontFamily = 'system-ui, sans-serif',
  lineHeight = 1.5,
  className,
  style,
}: TranscriptionTextProps): React.ReactElement {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const previousTextRef = useRef(text);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Handle text changes
  useEffect(() => {
    // If text changed, determine starting point for animation
    if (text !== previousTextRef.current) {
      const prevText = previousTextRef.current;

      // Find common prefix length
      let commonLength = 0;
      const minLen = Math.min(prevText.length, text.length);
      for (let i = 0; i < minLen; i++) {
        if (prevText[i] === text[i]) {
          commonLength = i + 1;
        } else {
          break;
        }
      }

      // Start animation from the common prefix
      if (animationMode === 'instant') {
        setDisplayedLength(text.length);
        setIsTyping(false);
      } else {
        setDisplayedLength(commonLength);
        setIsTyping(true);
      }

      previousTextRef.current = text;
    }
  }, [text, animationMode]);

  // Typing animation
  useEffect(() => {
    if (!isTyping || displayedLength >= text.length) {
      setIsTyping(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayedLength((prev) => {
        if (prev >= text.length) {
          setIsTyping(false);
          return prev;
        }

        if (animationMode === 'word') {
          return getNextWordEnd(text, prev);
        }
        return prev + 1;
      });
    }, typingSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayedLength, text, animationMode, typingSpeed, isTyping]);

  // Get displayed text
  const displayedText = text.slice(0, displayedLength);

  // Render text with confidence highlighting
  const renderTextWithConfidence = useCallback(() => {
    if (!showConfidence || !wordConfidences || wordConfidences.length === 0) {
      return <span style={{ color: textColor }}>{displayedText}</span>;
    }

    const words = splitIntoWords(displayedText);

    return (
      <>
        {words.map((word, index) => {
          const confidence = wordConfidences[index] ?? 1;
          const color = getConfidenceColor(
            confidence,
            textColor,
            lowConfidenceColor
          );

          return (
            <span
              key={index}
              style={{
                color,
                transition: 'color 0.2s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </>
    );
  }, [
    displayedText,
    showConfidence,
    wordConfidences,
    textColor,
    lowConfidenceColor,
  ]);

  // Container styles
  const containerStyle = useMemo(
    () => ({
      fontSize,
      fontFamily,
      lineHeight,
      ...style,
    }),
    [fontSize, fontFamily, lineHeight, style]
  );

  // Cursor styles
  const cursorStyle = useMemo(
    () => ({
      display: 'inline-block',
      width: 2,
      height: '1em',
      backgroundColor: cursorColor,
      marginLeft: 2,
      verticalAlign: 'text-bottom',
      animation: 'transcription-cursor-blink 1s step-end infinite',
    }),
    [cursorColor]
  );

  return (
    <div className={className} style={containerStyle}>
      {/* Main transcribed text */}
      {renderTextWithConfidence()}

      {/* Interim text (not yet confirmed) */}
      {interimText && (
        <span
          style={{
            color: interimColor,
            fontStyle: 'italic',
          }}
        >
          {interimText}
        </span>
      )}

      {/* Blinking cursor */}
      {showCursor && <span style={cursorStyle} />}
    </div>
  );
}
