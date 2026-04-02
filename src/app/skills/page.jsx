'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTransitionRouter } from '@/components/TransitionContext';
import styles from './skills.module.css';

// ── Skills data (Jai's actual skills) ─────────────────────────────────
const SKILLS = [
  // Languages
  { label: 'Java',            color: '#5b8dd9' },
  { label: 'Python',          color: '#ffd43b' },
  // Web
  { label: 'HTML / CSS',      color: '#fb923c' },
  { label: 'JavaScript',      color: '#f0db4f' },
  // Data
  { label: 'MySQL',           color: '#4db33d' },
  // Tools
  { label: 'Git & GitHub',    color: '#f1502f' },
  // CS Fundamentals
  { label: 'DSA (Java)',       color: '#a78bfa' },
  // Soft skills
  { label: 'Adaptability',    color: '#34d399' },
  { label: 'Teamwork',        color: '#60a5fa' },
  { label: 'Problem-Solving', color: '#f472b6' },
  { label: 'Good Listener',   color: '#fbbf24' },
];

/**
 * Distribute chips in a perfectly balanced grid across the screen using vw/vh.
 * This ensures equal spacing, no overlapping, and avoids edge bleeding.
 */
function buildGridPositions(count, columns = 4) {
  const rows = Math.ceil(count / columns);
  const pos = [];
  
  // We want to map these to vw/vh offsets relative to the center origin (51vw, 55vh).
  // Horizontal spread: ~75vw. Vertical spread: ~46vh (from 24vh to 70vh).
  const horizontalGapVw = 75 / (columns - 1);
  const verticalGapVh   = 46 / (rows - 1);

  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / columns);
    const c = i % columns;
    
    // Items in this specific row (to center the last row if it's not full)
    const itemsInRow = (r === rows - 1) ? count - (r * columns) : columns;
    
    // Calculate Absolute X in vw (Center of screen is 50vw)
    const rowWidthVw = (itemsInRow - 1) * horizontalGapVw;
    const startXVw   = 50 - (rowWidthVw / 2);
    const absXVw     = startXVw + c * horizontalGapVw;
    
    // Calculate Absolute Y in vh (Shifting the center of the block up to 41vh)
    const totalHeightVh = (rows - 1) * verticalGapVh;
    const startYVh      = 41 - (totalHeightVh / 2);
    const absYVh        = startYVh + r * verticalGapVh;

    // Return offsets relative to the Headlight origin at (51vw, 55vh)
    pos.push({ 
      x: `${absXVw - 51}vw`, 
      y: `${absYVh - 55}vh` 
    });
  }
  return pos;
}

// ── Web-Audio engine synth ─────────────────────────────────────────────
function buildEngine(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0;

  const osc1 = ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 45;
  const osc2 = ctx.createOscillator(); osc2.type = 'square';   osc2.frequency.value = 90;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 180; filter.Q.value = 5;

  // Idle LFO – simulates cylinder rhythm
  const lfo     = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 4;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain); lfoGain.connect(master.gain);

  osc1.connect(filter); osc2.connect(filter); filter.connect(master); master.connect(ctx.destination);
  osc1.start(); osc2.start(); lfo.start();
  return { master, osc1, osc2, filter };
}

function engineStart(e, ctx) {
  const t = ctx.currentTime;
  e.master.gain.cancelScheduledValues(t);
  e.master.gain.setValueAtTime(0, t);
  e.master.gain.linearRampToValueAtTime(0.46, t + 1.5);
  e.master.gain.linearRampToValueAtTime(0.22, t + 3.2);

  e.osc1.frequency.setValueAtTime(38, t);
  e.osc1.frequency.linearRampToValueAtTime(115, t + 1.5);
  e.osc1.frequency.linearRampToValueAtTime(52,  t + 3.2);

  e.osc2.frequency.setValueAtTime(76, t);
  e.osc2.frequency.linearRampToValueAtTime(230, t + 1.5);
  e.osc2.frequency.linearRampToValueAtTime(104, t + 3.2);

  e.filter.frequency.setValueAtTime(140, t);
  e.filter.frequency.linearRampToValueAtTime(950, t + 1.5);
  e.filter.frequency.linearRampToValueAtTime(310, t + 3.2);
}

/** Smooth engine shutdown — ramp gain to 0, then close the AudioContext */
function engineStop(e, ctx, duration = 2.0) {
  if (!ctx || ctx.state === 'closed') return;
  const t = ctx.currentTime;
  e.master.gain.cancelScheduledValues(t);
  e.master.gain.setValueAtTime(e.master.gain.value, t);
  // Decelerate: rev down then die
  e.osc1.frequency.linearRampToValueAtTime(38, t + duration * 0.7);
  e.osc2.frequency.linearRampToValueAtTime(76, t + duration * 0.7);
  e.filter.frequency.linearRampToValueAtTime(140, t + duration * 0.7);
  e.master.gain.linearRampToValueAtTime(0, t + duration);
  setTimeout(() => {
    if (ctx.state !== 'closed') ctx.close();
  }, (duration + 0.15) * 1000);
}

// ── Component ──────────────────────────────────────────────────────────
const POSITIONS = buildGridPositions(SKILLS.length);

// Phases: 'idle' → 'starting' → 'running' → 'stopping' → 'idle'
export default function SkillsPage() {
  const { smoothNavigate, isExiting: globalIsExiting } = useTransitionRouter();

  const [phase,    setPhase]    = useState('idle');
  const [visible,  setVisible]  = useState([]);
  const [entering, setEntering] = useState(true);
  const [exiting,  setExiting]  = useState(false);

  const audioCtxRef = useRef(null);
  const engineRef   = useRef(null);
  const timersRef   = useRef([]);

  // ── Entry fade-in ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => setEntering(false), 50);
    return () => clearTimeout(id);
  }, []);

  // ── Hard kill on unmount (navigation / HMR) ────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== 'closed') {
        try {
          if (engineRef.current) {
            engineRef.current.master.gain.cancelScheduledValues(ctx.currentTime);
            engineRef.current.master.gain.setValueAtTime(0, ctx.currentTime);
          }
        } catch (_) {}
        ctx.close();
      }
    };
  }, []);

  // ── Listen for Global Exit Transition to shutdown engine ─────────
  useEffect(() => {
    const handleGlobalExit = () => {
      setExiting(true);
      if (engineRef.current && audioCtxRef.current) {
        engineStop(engineRef.current, audioCtxRef.current, 0.65);
      }
    };
    window.addEventListener('page-exiting', handleGlobalExit);
    return () => window.removeEventListener('page-exiting', handleGlobalExit);
  }, []);

  // ── Arrow-key navigation ───────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  smoothNavigate('/');
      if (e.key === 'ArrowRight') smoothNavigate('/experience');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [smoothNavigate]);

  // ── Toggle ON: start engine ────────────────────────────────────────
  const handleTurnOn = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('starting');

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const eng = buildEngine(ctx);
    engineRef.current = eng;
    engineStart(eng, ctx);

    const t1 = setTimeout(() => setPhase('running'), 1900);
    const t2 = setTimeout(() => {
      SKILLS.forEach((_, i) => {
        const t = setTimeout(() => setVisible(v => [...v, i]), i * 180);
        timersRef.current.push(t);
      });
    }, 2600);
    timersRef.current.push(t1, t2);
  }, [phase]);

  // ── Toggle OFF: smooth shutdown ───────────────────────────────────
  const handleTurnOff = useCallback(() => {
    if (phase !== 'running') return;
    setPhase('stopping');

    // Smooth engine shutdown (2.2 s deceleration)
    if (engineRef.current && audioCtxRef.current) {
      engineStop(engineRef.current, audioCtxRef.current, 2.2);
    }

    // After engine and chip fade-out settle → reset to idle
    const id = setTimeout(() => {
      setVisible([]);
      setPhase('idle');
      audioCtxRef.current = null;
      engineRef.current   = null;
    }, 2400);
    timersRef.current.push(id);
  }, [phase]);

  // ── Toggle handler (click) ─────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (phase === 'idle')    handleTurnOn();
    if (phase === 'running') handleTurnOff();
    // Ignore clicks during 'starting' / 'stopping' transitions
  }, [phase, handleTurnOn, handleTurnOff]);

  // ── Derived toggle state ───────────────────────────────────────────
  const isOn      = phase === 'starting' || phase === 'running';
  const isBusy    = phase === 'starting' || phase === 'stopping';
  const isStopping = phase === 'stopping';

  // ── Scene classes ──────────────────────────────────────────────────
  const sceneClass = [
    styles.scene,
    phase === 'starting' ? styles.vibrating : '',
    entering ? styles.sceneEntering : '',
    exiting  ? styles.sceneExiting  : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={sceneClass}>

        {/* Dark overlay */}
        <div className={`${styles.overlay} ${phase === 'running' ? styles.overlayRunning : ''} ${isStopping ? styles.overlayRunning : ''}`} />

        {/* Headlight glow + floating skills */}
        <div className={`${styles.glowWrap} ${phase !== 'idle' ? styles.glowVisible : ''} ${phase === 'running' || isStopping ? styles.glowFull : ''} ${isStopping ? styles.glowFading : ''}`}>
          {visible.map(i => {
            const skill = SKILLS[i];
            let x = POSITIONS[i].x;
            let y = POSITIONS[i].y;

            return (
              <div
                key={i}
                className={`${styles.chipOuter} ${isStopping ? styles.chipFading : ''}`}
                style={{
                  '--x':     x,
                  '--y':     y,
                  '--delay': `${i * 0.12}s`,
                  '--fi':    `${i * 0.06}s`,   
                }}
              >
                <span className={styles.chip} style={{ '--c': skill.color }}>
                  {skill.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Engine Toggle Switch ── */}
        <div className={styles.toggleWrap}>
          <span className={`${styles.toggleLabel} ${isOn ? styles.toggleLabelOn : ''}`}>
            {phase === 'idle'     && 'ENGINE OFF'}
            {phase === 'starting' && 'STARTING…'}
            {phase === 'running'  && 'ENGINE ON'}
            {phase === 'stopping' && 'SHUTTING DOWN…'}
          </span>

          <button
            id="engine-toggle"
            className={`${styles.toggleTrack} ${isOn ? styles.toggleTrackOn : ''} ${isBusy ? styles.toggleTrackBusy : ''}`}
            onClick={handleToggle}
            aria-label={isOn ? 'Turn off engine' : 'Turn on engine'}
            title={isOn ? 'Turn off engine' : 'Turn on engine'}
          >
            {/* Track glow line */}
            <span className={styles.toggleLine} />

            {/* Thumb */}
            <span className={`${styles.toggleThumb} ${isOn ? styles.toggleThumbOn : ''} ${phase === 'starting' ? styles.toggleThumbPulsing : ''}`}>
              {phase === 'starting' ? '🔥' : phase === 'stopping' ? '💨' : isOn ? '⚡' : '○'}
            </span>
          </button>

          {/* Starting feedback bar */}
          {phase === 'starting' && <span className={styles.startingDots} />}
        </div>
      </div>

      {/* ── Navigation arrows ── */}
      <button className="page-arrow arrow-left"  onClick={() => smoothNavigate('/')}         title="Previous page" aria-label="Previous page">&#8249;</button>
      <button className="page-arrow arrow-right" onClick={() => smoothNavigate('/experience')} title="Next page"     aria-label="Next page">&#8250;</button>
    </>
  );
}
