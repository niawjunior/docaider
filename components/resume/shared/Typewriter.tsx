"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TextSegment {
  text: string;
  className?: string;
}

interface TypewriterProps {
  segments: TextSegment[];
  delay?: number;
  speed?: number; // ms per character
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({ 
  segments, 
  delay = 0, 
  speed = 30, 
  onComplete,
  className 
}: TypewriterProps) {
  const [displayedSegments, setDisplayedSegments] = useState<TextSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isInView && !hasStarted) {
      timeout = setTimeout(() => {
        setHasStarted(true);
      }, delay * 1000);
    }

    return () => clearTimeout(timeout);
  }, [isInView, hasStarted, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (currentSegmentIndex >= segments.length) {
      if (!hasCompleted) {
        setHasCompleted(true);
        if (onComplete) onComplete();
      }
      return;
    }

    const currentSegment = segments[currentSegmentIndex];
    
    if (currentCharIndex < currentSegment.text.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Finished current segment, move to next
      setDisplayedSegments(prev => [...prev, currentSegment]);
      setCurrentSegmentIndex(prev => prev + 1);
      setCurrentCharIndex(0);
    }
  }, [hasStarted, currentSegmentIndex, currentCharIndex, segments, speed, onComplete, hasCompleted]);

  // Construct the visible text
  const renderedSegments = [
    ...displayedSegments,
    // The currently typing segment
    ...(currentSegmentIndex < segments.length ? [{
      ...segments[currentSegmentIndex],
      text: segments[currentSegmentIndex].text.slice(0, currentCharIndex)
    }] : [])
  ];

  const isComplete = currentSegmentIndex >= segments.length;

  return (
    <div ref={containerRef} className={className}>
      {renderedSegments.map((segment, index) => (
        <span key={index} className={segment.className}>
          {segment.text}
        </span>
      ))}
      {!isComplete && (
        <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
}
