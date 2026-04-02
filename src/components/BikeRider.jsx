'use client';
import { motion } from 'framer-motion';

export default function BikeRider({ bikeX, bikeY, bikeRot }) {
  return (
    <motion.g style={{ x: bikeX, y: bikeY, rotate: bikeRot }}>
      {/* Bike is drawn centered so its body sits exactly on the path point (0,0) */}
      {/* The body runs from y=-18 to y=19, center ~= y=0 after translating -6 */}
      <g transform="translate(0,-6) scale(1.4)">

        {/* Headlight Glow Beams pointing forward (up in local space = -y) */}
        <polygon points="-4,-12 4,-12 14,-38 -14,-38" fill="rgba(255, 140, 0, 0.12)" />
        <polygon points="-2,-12 2,-12 7,-28 -7,-28" fill="rgba(255, 140, 0, 0.28)" />

        {/* Front Tire */}
        <rect x="-1.5" y="-12" width="3" height="7" rx="1.5" fill="#1a1a1a" />

        {/* Front Fender */}
        <path d="M -3,-6 L 3,-6 L 2.5,-2 L -2.5,-2 Z" fill="#e0e0e0" />

        {/* Handlebars */}
        <path d="M -7,-2 Q 0,-4.5 7,-2" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" />

        {/* Gas Tank — Cyan accent, visually centred on 0,0 */}
        <ellipse cx="0" cy="3" rx="4" ry="6" fill="#06b6d4" filter="drop-shadow(0 0 6px rgba(6,182,212,0.9))" />

        {/* Seat */}
        <rect x="-2.5" y="8" width="5" height="6" rx="2" fill="#111" />

        {/* Rear Fender */}
        <path d="M -3,13 L 3,13 L 2,17 L -2,17 Z" fill="#e0e0e0" />

        {/* Rear Tire */}
        <rect x="-2" y="16" width="4" height="8" rx="1.5" fill="#1a1a1a" />

        {/* Red Tail Light */}
        <circle cx="0" cy="17" r="1.5" fill="#ff2020" filter="drop-shadow(0 0 4px red)" />
      </g>
    </motion.g>
  );
}
