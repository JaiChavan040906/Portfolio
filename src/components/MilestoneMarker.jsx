'use client';
import { motion } from 'framer-motion';
import styles from '@/app/experience/experience.module.css';

export default function MilestoneMarker({ x, y, data, onClick, isVisible }) {
  if (!isVisible) return null;
  
  const isExp = data.type === 'experience';
  const isProj = data.type === 'project';
  const isStart = data.type === 'start';

  let color = '#ffffff'; // Default for start
  let icon = '🏁';
  let badgeText = 'START';

  if (isExp) {
    color = '#f59e0b'; // Amber/Orange
    icon = '💼'; // Briefcase
    badgeText = 'WORK';
  } else if (isProj) {
    color = '#06b6d4'; // Cyan
    icon = '🚀'; // Rocket
    badgeText = 'PROJECT';
  }
  
  const glow = `0 0 15px ${color}, 0 0 30px ${color}`;

  // Start anchor stays directly on the road entirely
  if (isStart) {
    return (
      <foreignObject x={x - 100} y={y - 100} width="200" height="200" style={{ overflow: 'visible' }}>
        <motion.div 
          className={styles.markerWrap}
          style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          onClick={() => onClick(data)}
        >
          <div 
            className={styles.markerCore} 
            style={{ 
              background: 'rgba(20, 25, 35, 0.95)', boxShadow: glow, display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${color}`, fontSize: '0.85rem'
            }} 
          >
            {icon}
          </div>
          <div className={styles.markerLabel} style={{ top: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {data.title}
          </div>
        </motion.div>
      </foreignObject>
    );
  }

  // Strictly alternating sequence for perfect mechanical consistency
  const isUp = data.id % 2 !== 0;

  // Rigid diagonal sawtooth grid. Absolutely identical math on all nodes guarantees 
  // high structural visual consistency while completely dodging the physical road
  const dx = isUp ? -50 : 50;
  const dy = isUp ? -110 : 110; 

  // Mount labels laterally instead of vertically. Left branches get left-aligned text, right branches get right-aligned text.
  const labelSide = isUp ? 'left' : 'right';

  // Explicit user override just for Parallax
  const isParallax = data.id === 8;

  return (
    <g>
      {/* 1. The anchor point located perfectly on the asphalt coordinates */}
      <motion.circle 
        cx={x} cy={y} r="5" 
        fill="#111" 
        stroke={color} 
        strokeWidth="3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
      />

      {/* 2. Structured, purely custom angled dash-line connecting the road to the icon */}
      <motion.line 
        x1={x} y1={y} 
        x2={x + dx} y2={y + dy}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      />

      {/* 3. Floating UI Container explicitly given 300px height so text labels NEVER clip vertically */}
      <foreignObject x={x + dx - 200} y={y + dy - 150} width="400" height="300" style={{ overflow: 'visible' }}>
        <motion.div 
          className={styles.markerWrap}
          style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
          initial={{ scale: 0, opacity: 0, x: isParallax ? 0 : (labelSide === 'left' ? 15 : -15), y: isParallax ? -15 : 0 }}
          animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.35 }}
        >
          {/* Core Shape + Emoji */}
          <div 
            className={styles.markerCore} 
            onClick={() => onClick(data)}
            style={{ 
              background: 'rgba(20, 25, 35, 0.95)', 
              boxShadow: glow, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: isProj ? '8px' : '50%',
              border: `2px solid ${color}`,
              fontSize: '1.2rem',
              zIndex: 10,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }} 
          >
            {icon}
          </div>
          
          {/* Custom label implementation. Lateral by default, uniquely overridden underneath for Parallax */}
          <div 
            className={styles.markerLabel} 
            onClick={() => onClick(data)}
            style={{ 
              position: 'absolute',
              top: isParallax ? 'calc(50% + 30px)' : '50%',
              transform: isParallax ? 'translate(-50%, 0)' : 'translateY(-50%)',
              right: isParallax ? 'auto' : (labelSide === 'left' ? 'calc(50% + 30px)' : 'auto'),
              left: isParallax ? '50%' : (labelSide === 'right' ? 'calc(50% + 30px)' : 'auto'),
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: isParallax ? 'center' : (labelSide === 'left' ? 'flex-end' : 'flex-start'),
              textAlign: isParallax ? 'center' : (labelSide === 'left' ? 'right' : 'left'),
              pointerEvents: 'auto',
              cursor: 'pointer',
              width: 'max-content',
              maxWidth: '180px',
              whiteSpace: 'normal',
              lineHeight: '1.3'
            }}
          >
            <div style={{ 
              fontSize: '0.65rem', color: color, fontWeight: 800, 
              letterSpacing: '1px', margin: '0 0 4px 0', textTransform: 'uppercase'
            }}>
              {badgeText}
            </div>
            {data.title}
            <span className={styles.markerLabelDate} style={{ marginTop: '2px', display: 'block' }}>{data.date}</span>
          </div>
        </motion.div>
      </foreignObject>
    </g>
  );
}
