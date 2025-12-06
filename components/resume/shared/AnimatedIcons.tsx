"use client";

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  color?: string;
}

export const ScanAnimation = ({ className, color = "text-blue-400" }: IconProps) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
          <linearGradient id="scan-gradient" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.5" stopColor="currentColor" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
      </defs>
      <path className={cn("stroke-current stroke-[4px] stroke-round stroke-join", color)} d="M30 20H70C75.5228 20 80 24.4772 80 30V80C80 85.5228 75.5228 90 70 90H30C24.4772 90 20 85.5228 20 80V30C20 24.4772 24.4772 20 30 20Z" />
      <path className={cn("stroke-current stroke-[3px] opacity-30", color)} d="M35 40H65" />
      <path className={cn("stroke-current stroke-[3px] opacity-30", color)} d="M35 55H65" />
      <path className={cn("stroke-current stroke-[3px] opacity-30", color)} d="M35 70H50" />
      <rect x="15" y="0" width="70" height="6" rx="3" className={cn("fill-current animate-scan-beam opacity-80", color)} />
  </svg>
);

export const CircuitAnimation = ({ className, color = "text-purple-400" }: IconProps) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 20 L50 50" className={cn("stroke-current stroke-[2px] stroke-round opacity-30", color)} />
      <path d="M80 20 L50 50" className={cn("stroke-current stroke-[2px] stroke-round opacity-30", color)} />
      <path d="M50 85 L50 50" className={cn("stroke-current stroke-[2px] stroke-round opacity-30", color)} />
      
      <circle r="3" className={cn("fill-current", color)}>
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M20 20 L50 50" />
          <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle r="3" className={cn("fill-current", color)}>
          <animateMotion dur="2s" repeatCount="indefinite" path="M80 20 L50 50" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r="3" className={cn("fill-current", color)}>
          <animateMotion dur="1.8s" repeatCount="indefinite" path="M50 85 L50 50" />
          <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" />
      </circle>

      <circle cx="20" cy="20" r="4" className={cn("fill-current opacity-60", color)} />
      <circle cx="80" cy="20" r="4" className={cn("fill-current opacity-60", color)} />
      <circle cx="50" cy="85" r="4" className={cn("fill-current opacity-60", color)} />
      <circle cx="50" cy="50" r="8" className={cn("fill-current animate-center-pulse", color)} />
  </svg>
);

export const SparkleAnimation = ({ className, color = "text-yellow-400" }: IconProps) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path className={cn("fill-current animate-sparkle-main", color)} d="M50 25L55 45L75 50L55 55L50 75L45 55L25 50L45 45L50 25Z" />
      <path className={cn("fill-current animate-sparkle-s1", color)} d="M20 20L22 28L30 30L22 32L20 40L18 32L10 30L18 28L20 20Z" />
      <path className={cn("fill-current animate-sparkle-s2", color)} d="M80 15L82 23L90 25L82 27L80 35L78 27L70 25L78 23L80 15Z" />
      <path className={cn("fill-current animate-sparkle-s3", color)} d="M60 70L62 78L70 80L62 82L60 90L58 82L50 80L58 78L60 70Z" />
  </svg>
);

export const RocketAnimation = ({ className, color = "text-green-400" }: IconProps) => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g className="animate-rocket-group">
          <path className={cn("fill-none stroke-current stroke-[4px]", color)} strokeLinecap="round" strokeLinejoin="round" d="M50 20C50 20 70 40 70 60C70 65 65 80 65 80H35C35 80 30 65 30 60C30 40 50 20 50 20Z" />
          <path className={cn("fill-current opacity-20", color)} d="M50 20C50 20 70 40 70 60C70 65 65 80 65 80H35C35 80 30 65 30 60C30 40 50 20 50 20Z" />
          <circle cx="50" cy="50" r="8" className={cn("fill-none stroke-current stroke-[4px]", color)} />
          <path className={cn("fill-none stroke-current stroke-[4px]", color)} strokeLinecap="round" d="M30 60L15 75V80H35" />
          <path className={cn("fill-none stroke-current stroke-[4px]", color)} strokeLinecap="round" d="M70 60L85 75V80H65" />
          <line x1="50" y1="85" x2="50" y2="95" className={cn("stroke-current stroke-[3px] animate-flame-1", color)} strokeLinecap="round" />
          <line x1="42" y1="83" x2="42" y2="90" className={cn("stroke-current stroke-[3px] animate-flame-2", color)} strokeLinecap="round" />
          <line x1="58" y1="83" x2="58" y2="90" className={cn("stroke-current stroke-[3px] animate-flame-2", color)} strokeLinecap="round" />
      </g>
  </svg>
);
