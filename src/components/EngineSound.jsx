'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * EngineSound – synthesises a motorcycle engine-start sound
 * using the Web Audio API. Plays once when the page first loads.
 * A small 🔊/🔇 button lets the user mute/replay.
 */
export default function EngineSound() {
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(false);
  const ctxRef = useRef(null);

  /* ── helpers ── */
  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }

  function playEngine() {
    const ctx = getCtx();

    // ── master gain (overall volume) ──
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.15);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.5);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.8);
    master.connect(ctx.destination);

    // ── low-frequency rumble oscillator ──
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(38, ctx.currentTime);          // crank
    osc1.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.3);
    osc1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.9);  // catch
    osc1.frequency.linearRampToValueAtTime(110, ctx.currentTime + 1.6); // rev
    osc1.frequency.linearRampToValueAtTime(70, ctx.currentTime + 3.0);  // settle idle
    osc1.frequency.linearRampToValueAtTime(65, ctx.currentTime + 3.8);

    // ── distortion / grit for mechanical texture ──
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(320);
    distortion.oversample = '4x';

    // ── low-pass filter to soften harshness ──
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(600, ctx.currentTime);
    lpf.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 1.5);
    lpf.frequency.linearRampToValueAtTime(900, ctx.currentTime + 3.5);

    // ── exhaust "pop" noise burst at start ──
    const noiseBuffer = makeNoiseBuffer(ctx, 0.25);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseLpf = ctx.createBiquadFilter();
    noiseLpf.type = 'bandpass';
    noiseLpf.frequency.value = 180;
    noiseLpf.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);

    // ── second oscillator for harmonic richness ──
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(76, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.9);
    osc2.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.6);
    osc2.frequency.linearRampToValueAtTime(140, ctx.currentTime + 3.0);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, ctx.currentTime);
    osc2Gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3.8);

    // ── connect graph ──
    osc1.connect(distortion);
    distortion.connect(lpf);
    lpf.connect(master);

    osc2.connect(osc2Gain);
    osc2Gain.connect(master);

    noiseSource.connect(noiseLpf);
    noiseLpf.connect(noiseGain);
    noiseGain.connect(master);

    // ── start & stop ──
    const t = ctx.currentTime;
    osc1.start(t);
    osc2.start(t);
    noiseSource.start(t);

    osc1.stop(t + 4);
    osc2.stop(t + 4);
    noiseSource.stop(t + 0.3);
  }

  /* distortion curve helper */
  function makeDistortionCurve(amount) {
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  /* white-noise buffer helper */
  function makeNoiseBuffer(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(sampleRate * duration);
    const buf = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  /* ── auto-play on mount (browsers require user gesture; we try, fallback to button) ── */
  useEffect(() => {
    if (muted) return;
    const timer = setTimeout(() => {
      try {
        playEngine();
        setPlayed(true);
      } catch (_) {
        // silently ignore – user can click the button
      }
    }, 600); // slight delay so page paint completes first
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── UI ── */
  function handleToggle() {
    if (muted) {
      // unmute → replay
      setMuted(false);
      try {
        playEngine();
        setPlayed(true);
      } catch (_) {}
    } else {
      setMuted(true);
      // suspend ongoing audio if any
      ctxRef.current?.suspend();
    }
  }

  return (
    <button
      onClick={handleToggle}
      title={muted ? 'Unmute engine sound' : 'Mute engine sound'}
      aria-label={muted ? 'Unmute engine sound' : 'Mute engine sound'}
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '22px',
        zIndex: 9999,
        background: 'rgba(255,140,0,0.12)',
        border: '1px solid rgba(255,140,0,0.35)',
        borderRadius: '50%',
        width: '42px',
        height: '42px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.25s, transform 0.15s',
        color: '#ff8c00',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,140,0,0.28)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,140,0,0.12)')}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
