"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WizardSVG = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
        initial="idle"
        animate="idle"
      >
        {/* Glow Effect */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="robeGradient" x1="100" y1="60" x2="100" y2="180" gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
             <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo-600 */}
          </linearGradient>
          <linearGradient id="hatGradient" x1="100" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
             <stop offset="100%" stopColor="#312e81" /> {/* Indigo-900 */}
          </linearGradient>
        </defs>

        {/* Floating Group */}
        <motion.g
          variants={{
            idle: {
              y: [0, -10, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          }}
        >
            {/* Robe Back */}
            <path
              d="M60 180C60 180 70 140 100 140C130 140 140 180 140 180H60Z"
              fill="url(#robeGradient)"
              opacity="0.8"
            />
            
            {/* Main Body/Robe */}
            <path
              d="M70 180L80 100C80 100 80 80 100 80C120 80 120 100 120 100L130 180H70Z"
              fill="url(#robeGradient)"
            />
            
            {/* HEAD AREA */}
            {/* Beard */}
            <motion.path
                d="M85 85C85 85 90 110 100 110C110 110 115 85 115 85"
                fill="#e2e8f0" // Slate-200
                variants={{
                    idle: {
                        scale: [1, 1.02, 1],
                        transition: { duration: 2, repeat: Infinity }
                    }
                }}
            />

            {/* Face Shadow */}
            <ellipse cx="100" cy="80" rx="18" ry="16" fill="#f1f5f9" /> {/* Slate-100 */}
            
            {/* Eyes */}
            <motion.g
                 variants={{
                    idle: {
                        scaleY: [1, 0.1, 1, 1, 1], // Blink
                        transition: { duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }
                    }
                 }}
            >
                <circle cx="94" cy="78" r="2.5" fill="#1e293b" />
                <circle cx="106" cy="78" r="2.5" fill="#1e293b" />
            </motion.g>

            {/* Hat */}
            <motion.path
              d="M80 70L100 20L120 70H80Z"
              fill="url(#hatGradient)"
              variants={{
                idle: {
                    rotate: [-2, 2, -2],
                    originX: 0.5,
                    originY: 1,
                    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }
              }}
            />
            {/* Hat Brim */}
            <path d="M70 70C70 70 80 65 100 65C120 65 130 70 130 70" stroke="#312e81" strokeWidth="4" strokeLinecap="round" />


            {/* Right Hand Holding Staff */}
            <circle cx="130" cy="110" r="8" fill="#f1f5f9" />
            
            {/* Staff */}
            <motion.g
                variants={{
                    idle: {
                        rotate: [-5, 5, -5],
                        originX: 0.5,
                        originY: 1,
                        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }
                }}
            >
                <path d="M130 110L130 50" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                
                {/* Staff Orb */}
                <motion.circle 
                    cx="130" 
                    cy="45" 
                    r="8" 
                    fill="#3b82f6" 
                    filter="url(#glow)"
                    variants={{
                        idle: {
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8],
                            fill: ["#3b82f6", "#60a5fa", "#3b82f6"],
                            transition: { duration: 2, repeat: Infinity }
                        }
                    }}
                />
            </motion.g>

            {/* Left Hand (Wave) */}
            <motion.g
                variants={{
                    idle: {
                        y: [-2, 2, -2],
                        x: [-2, 0, -2],
                        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }
                }}
            >
               <circle cx="70" cy="110" r="8" fill="#f1f5f9" />
            </motion.g>

        </motion.g>


        {/* Particles / Magic Sparkles */}
        <motion.g>
           {[1, 2, 3].map((i) => (
               <motion.path
                  key={i}
                  d="M130 45L132 40L135 45L132 50Z"
                  fill="#fbbf24"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                      opacity: [0, 1, 0],
                      y: -30 - (i * 10),
                      x: (i % 2 === 0 ? 10 : -10) * i,
                      scale: [0, 1, 0],
                      rotate: [0, 180]
                  }}
                  transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut"
                  }}
               />
           ))}
        </motion.g>
        
        {/* Floating Doc Hint (Subtle) */}
        <motion.rect
            x="40"
            y="90"
            width="20"
            height="26"
            rx="2"
            fill="white"
            fillOpacity="0.2"
            initial={{ opacity: 0, y: 120, scale: 0.5 }}
            animate={{ opacity: [0, 0.6, 0], y: 80, scale: 1, rotate: -10 }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

      </motion.svg>
    </div>
  )
}

export default WizardSVG;