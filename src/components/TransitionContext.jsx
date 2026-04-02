'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);

  // Clear exiting state on route change (which catches browser Back/Forward implicitly)
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const smoothNavigate = useCallback((href) => {
    if (href === pathname || isExiting) return;
    setIsExiting(true);
    
    // Fire a custom event for local component cleanup during exit (e.g. fading audio out)
    window.dispatchEvent(new CustomEvent('page-exiting'));
    
    setTimeout(() => {
      router.push(href);
    }, 600); // Wait for global exit CSS animation
  }, [pathname, isExiting, router]);

  return (
    <TransitionContext.Provider value={{ smoothNavigate, isExiting }}>
      {children}
    </TransitionContext.Provider>
  );
}

// Wrapping just the page content so the Nav bar stays static
export function PageTransitionWrapper({ children }) {
  const { isExiting } = useTransitionRouter();
  return (
    <main className={`global-transition ${isExiting ? 'global-exiting' : 'global-entering'}`}>
      {children}
    </main>
  );
}

export const useTransitionRouter = () => useContext(TransitionContext);

// A simple drop-in replacement for next/link that hooks into our Transition Provider
export function TransitionLink({ href, children, className }) {
  const { smoothNavigate } = useTransitionRouter();
  
  return (
    <a 
      href={href} 
      className={className} 
      onClick={(e) => {
        // Allow ctrl/cmd+clicks to open in a new tab natively
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        smoothNavigate(href);
      }}
    >
      {children}
    </a>
  );
}
