'use client';
import styles from '@/app/experience/experience.module.css';

export default function Controls({ onPlay, onPause, onRestart, isPlaying }) {
  return (
    <div className={styles.controlsWrap}>
      {!isPlaying ? (
        <button className={styles.btnControl} onClick={onPlay}>Play Route</button>
      ) : (
        <button className={styles.btnControl} onClick={onPause}>Pause Route</button>
      )}
      <button className={styles.btnControl} onClick={onRestart}>Restart</button>
    </div>
  );
}
