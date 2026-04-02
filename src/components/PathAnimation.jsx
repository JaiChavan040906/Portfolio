'use client';
import { motion } from 'framer-motion';

export default function PathAnimation({ pathRef, pathD, progress }) {
  return (
    <>
      <defs>
        <linearGradient id="coolGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="50%" stopColor="#ffb732" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* 1. Deep shadow for the entire road structure */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="#000" 
        strokeWidth="60" 
        strokeLinecap="round" 
        filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))"
      />
      
      {/* 2. Rough dirt/gravel shoulders */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="#362920" 
        strokeWidth="52" 
        strokeLinecap="round" 
      />

      {/* 3. Outer edge of the asphalt (Curb/border) */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="#15171a" 
        strokeWidth="42" 
        strokeLinecap="round" 
      />

      {/* 4. Main smooth asphalt surface */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="#2d3036" 
        strokeWidth="38" 
        strokeLinecap="round" 
      />

      {/* 5. Center dashed dividing line (Yellow tracking) */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="#eda224" 
        strokeWidth="2" 
        strokeDasharray="20 24" 
        strokeLinecap="round"
      />
      
      {/* 6. Dim track background specifically for the glowing route line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke="rgba(6, 182, 212, 0.05)" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      
      {/* 7. Animated glowing route trail */}
      <motion.path 
        ref={pathRef}
        d={pathD} 
        fill="none" 
        stroke="url(#coolGradient)" 
        strokeWidth="4" 
        strokeLinecap="round"
        style={{ pathLength: progress }} 
        filter="drop-shadow(0 0 10px rgba(6, 182, 212, 0.7))"
      />
    </>
  );
}
