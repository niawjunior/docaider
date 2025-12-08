"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  duration?: number;
  loop?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export function ScrambleText({ 
  text, 
  className,
  scrambleSpeed = 30,
  duration = 800, 
  revealSpeed = 50,
  onComplete,
  loop = false
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let iteration = 0;
    const startTime = Date.now();
    
    // Clear previous intervals
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Initial state matching length
    
    // Animate
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Phase 1: Full Scramble
      // Stays in scramble if loop is true OR time hasn't passed
      const isScrambling = loop || elapsed < duration;

      if (isScrambling) {
        setDisplayText(
          text.split("")
            .map((char) => {
               if (char === " ") return " ";
               return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join("")
        );
      } 
      // Phase 2: Reveal
      else {
        setDisplayText(
          text.split("")
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              if (char === " ") return " ";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
           if (intervalRef.current) clearInterval(intervalRef.current);
           if (onComplete) onComplete();
        }
        
        iteration += 1/2; 
      }

    }, scrambleSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, duration, scrambleSpeed, revealSpeed, loop]);

  return (
    <span className={cn("inline-block font-mono", className)}>
      {displayText}
    </span>
  );
}
