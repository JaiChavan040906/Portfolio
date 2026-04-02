'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/experience/experience.module.css';

export default function PopupModal({ data, onClose }) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
            <h3 className={styles.modalTitle}>{data.title}</h3>
            <p className={styles.modalSubtitle}>{data.subtitle} • {data.date}</p>
            
            {data.type === 'experience' && data.details.responsibilities && (
              <ul className={styles.modalList}>
                {data.details.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            
            {data.type === 'project' && data.details.description && (
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                {data.details.description}
              </p>
            )}

            {data.type === 'project' && data.details.impact && (
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#fff' }}>Impact: </strong>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{data.details.impact}</span>
              </div>
            )}

            <div className={styles.modalTags}>
              {(data.details.tools || data.details.stack || []).map((t) => (
                <span key={t} className={styles.modalTag}>{t}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
