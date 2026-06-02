import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Navbar.css';

export default function Navbar() {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const pillsRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -80, opacity: 0, duration: 0.9, ease: 'power3.out',
      });
      gsap.from([logoRef.current, pillsRef.current, badgeRef.current], {
        y: -20, opacity: 0, duration: 0.7, ease: 'power2.out',
        stagger: 0.12, delay: 0.3,
      });
    });

    // Shrink-on-scroll
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => { ctx.revert(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-inner">
        <div className="nav-logo" ref={logoRef}>
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#lg1)" />
              <path d="M8 12L14 18L8 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 24H24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED"/>
                  <stop offset="1" stopColor="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>Coder<span className="logo-accent">Buddy</span></span>
        </div>

        <div className="nav-pills" ref={pillsRef}>
          <a href="#hero" className="nav-pill">Home</a>
          <a href="#pipeline" className="nav-pill">Pipeline</a>
          <a href="#workspace" className="nav-pill">Workspace</a>
        </div>

        <div className="nav-badge" ref={badgeRef}>
          <span className="badge-dot" />
          LangGraph Powered
        </div>
      </div>
    </nav>
  );
}
