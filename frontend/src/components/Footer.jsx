import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-inner > *', {
        opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 92%' },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer id="footer" className="footer" ref={footerRef}>
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#flg)" />
              <path d="M8 12L14 18L8 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 24H24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="flg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>Coder<span className="logo-accent">Buddy</span></span>
        </div>

        <p className="footer-copy">© 2025 Codebasics Inc. All rights reserved.</p>

        <div className="footer-stack">
          {['LangGraph', 'Groq', 'React', 'GSAP'].map((s) => (
            <span key={s} className="stack-badge">{s}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
