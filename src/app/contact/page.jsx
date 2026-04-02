'use client';

import { useState } from 'react';
import PageArrows from '@/components/PageArrows';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formState, setFormState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = () => {
    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const msg   = document.getElementById('message').value.trim();
    
    if (!name || !email || !msg) {
      setErrorMsg('Please fill in all required fields to connect.');
      setFormState('error');
      return;
    }

    // Strict Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setFormState('error');
      // Adding shake effect outline or similar could go here
      return;
    }

    setErrorMsg('');
    setFormState('loading');

    // Simulate backend network transmission delay for premium feel
    setTimeout(() => {
      setFormState('success');
      // Gracefully clear form
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('subject').value = '';
      document.getElementById('message').value = '';
      
      // Optionally reset back to idle after a few seconds
      setTimeout(() => setFormState('idle'), 4000);
    }, 1500);
  };

  return (
    <>
      <div className={styles.bgScene} />

      <div className={styles.pageWrap}>
        {/* LEFT: Contact Info */}
        <div className={styles.infoSide}>
          <p className={styles.tagline}>Let's Connect</p>
          <p className={styles.infoQuote}>
            &ldquo;No matter where the road leads next,<br />
            feel free to reach out.&rdquo;
          </p>

          <div className={styles.contactLinks}>
            {[
              { label: 'Email',    value: 'jai.work.0409@gmail.com',         href: 'mailto:jai.work.0409@gmail.com' },
              { label: 'LinkedIn', value: 'linkedin.com/in/jaichvn',          href: 'https://www.linkedin.com/in/jaichvn' },
              { label: 'GitHub',   value: 'github.com/JaiChavan040906',       href: 'https://github.com/JaiChavan040906' },
              { label: 'Location', value: 'Mumbai, Maharashtra, India 🇮🇳',    href: null },
            ].map(({ label, value, href }) => (
              <div key={label} className={styles.contactLinkItem}>
                <span className={styles.linkLabel}>{label}</span>
                {href
                  ? <a className={styles.linkValue} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{value}</a>
                  : <span className={styles.linkValue}>{value}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Contact Form */}
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <h3>Send a Message</h3>
            <p className={styles.sub}>I'll get back to you as soon as possible.</p>

            <div className={styles.formGroup}>
              <label htmlFor="name">Your Name <span className={styles.req}>*</span></label>
              <input id="name" type="text" placeholder="Rahul Sharma" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
              <input id="email" type="email" placeholder="rahul@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input id="subject" type="text" placeholder="Let's collaborate…" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Message <span className={styles.req}>*</span></label>
              <textarea id="message" rows={4} placeholder="Hey Jai, I'd love to…" />
            </div>

            {formState === 'error' && (
              <div className={styles.errorBanner}>{errorMsg}</div>
            )}

            <button
              className={`${styles.btnSend} ${formState === 'success' ? styles.btnSent : ''} ${formState === 'loading' ? styles.btnLoading : ''}`}
              onClick={handleSend}
              disabled={formState === 'loading' || formState === 'success'}
            >
              {formState === 'idle' && 'Send Message →'}
              {formState === 'error' && 'Fix Errors & Send →'}
              {formState === 'loading' && 'Transmitting...'}
              {formState === 'success' && 'Message Sent ✓'}
            </button>
          </div>
        </div>
      </div>

      <PageArrows prev="/experience" />
    </>
  );
}
