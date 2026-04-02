'use client';

import { useEffect } from 'react';
import { useTransitionRouter } from '@/components/TransitionContext';

export default function PageArrows({ prev, next }) {
  const { smoothNavigate } = useTransitionRouter();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft'  && prev) smoothNavigate(prev);
      if (e.key === 'ArrowRight' && next) smoothNavigate(next);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next, smoothNavigate]);

  return (
    <>
      {prev && (
        <button
          className="page-arrow arrow-left"
          onClick={() => smoothNavigate(prev)}
          title="Previous page"
          aria-label="Previous page"
        >
          &#8249;
        </button>
      )}
      {next && (
        <button
          className="page-arrow arrow-right"
          onClick={() => smoothNavigate(next)}
          title="Next page"
          aria-label="Next page"
        >
          &#8250;
        </button>
      )}
    </>
  );
}
