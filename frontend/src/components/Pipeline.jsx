import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Pipeline.css';

gsap.registerPlugin(ScrollTrigger);

const AGENTS = [
  {
    id: 'planner',
    num: '01',
    emoji: '🧠',
    name: 'Planner',
    color: 'purple',
    desc: 'Analyzes your natural language request and generates a structured project plan — tech stack, features, and file architecture.',
    outputs: ['Project name & description', 'Tech stack selection', 'Feature list', 'File architecture'],
  },
  {
    id: 'architect',
    num: '02',
    emoji: '🏗️',
    name: 'Architect',
    color: 'cyan',
    desc: 'Breaks the plan into explicit, ordered engineering tasks with context, dependencies, and integration details for each file.',
    outputs: ['Ordered task list', 'File-level specs', 'Dependency mapping', 'Integration context'],
  },
  {
    id: 'coder',
    num: '03',
    emoji: '💻',
    name: 'Coder',
    color: 'green',
    desc: 'A ReAct agent that implements each task — reads existing files, writes full implementations, and iterates until done.',
    outputs: ['Full file implementation', 'Compatible imports', 'Consistent naming', 'Working project files'],
  },
];

export default function Pipeline({ agentStates }) {
  const sectionRef = useRef(null);
  const cardRefs   = useRef([]);
  const arrowRefs  = useRef([]);
  const particle1  = useRef(null);
  const particle2  = useRef(null);
  const loopRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-triggered card reveal
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          opacity: 0, y: 60, scale: 0.93,
          duration: 0.75, ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
          delay: i * 0.15,
        });
      });

      // Arrow reveal
      arrowRefs.current.forEach((arrow) => {
        if (!arrow) return;
        gsap.from(arrow, {
          opacity: 0, scaleX: 0,
          duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: arrow, start: 'top 85%' },
        });
      });

      // Loop arrow reveal
      if (loopRef.current) {
        gsap.from(loopRef.current, {
          opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: loopRef.current, start: 'top 90%' },
        });
      }

      // Section title
      gsap.from('.pipeline .section-tag, .pipeline .section-title, .pipeline .section-subtitle', {
        opacity: 0, y: 30, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Particle animation along arrows when agents are running ── */
  useEffect(() => {
    const animateParticle = (el, delay) => {
      if (!el) return;
      gsap.killTweensOf(el);
      gsap.fromTo(el, { left: '0%', opacity: 1 }, {
        left: '100%', duration: 1.2, repeat: -1,
        ease: 'none', delay, opacity: 1,
      });
    };

    if (agentStates.architect === 'running' || agentStates.architect === 'done') {
      animateParticle(particle1.current, 0);
    }
    if (agentStates.coder === 'running' || agentStates.coder === 'done') {
      animateParticle(particle2.current, 0);
    }
  }, [agentStates]);

  /* ── Active ring pulse ── */
  useEffect(() => {
    AGENTS.forEach(({ id }) => {
      const ring = document.querySelector(`.ring-${id}`);
      if (!ring) return;
      gsap.killTweensOf(ring);
      if (agentStates[id] === 'running') {
        gsap.to(ring, { boxShadow: `0 0 0 6px rgba(124,58,237,0.3)`, scale: 1.08, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      } else {
        gsap.to(ring, { boxShadow: 'none', scale: 1, duration: 0.4 });
      }
    });
  }, [agentStates]);

  const getStateBadge = (id) => {
    const s = agentStates[id];
    if (s === 'running') return { text: 'Running…', cls: 'badge-running' };
    if (s === 'done')    return { text: '✓ Done',   cls: 'badge-done'    };
    return                       { text: 'Idle',     cls: 'badge-idle'    };
  };

  return (
    <section id="pipeline" className="pipeline" ref={sectionRef}>
      <div className="section-header">
        <div className="section-tag">How It Works</div>
        <h2 className="section-title">The Agent Pipeline</h2>
        <p className="section-subtitle">
          Three specialized agents collaborate in sequence to deliver your project end-to-end.
        </p>
      </div>

      <div className="pipeline-track">
        {AGENTS.map((agent, i) => {
          const badge = getStateBadge(agent.id);
          return (
            <div key={agent.id} className="pipeline-col">
              {/* Agent card */}
              <div
                className={`agent-card color-${agent.color} state-${agentStates[agent.id]}`}
                ref={(el) => (cardRefs.current[i] = el)}
              >
                <div className="agent-card-glow" />
                <div className={`agent-ring ring-${agent.id}`}>
                  <span className="agent-emoji">{agent.emoji}</span>
                </div>
                <div className="agent-num">{agent.num}</div>
                <h3 className="agent-name">{agent.name}</h3>
                <p className="agent-desc">{agent.desc}</p>
                <div className="agent-outputs">
                  <div className="outputs-label">Output</div>
                  {agent.outputs.map((o) => (
                    <div key={o} className="output-row">
                      <span className="output-dot" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
                <div className={`state-badge ${badge.cls}`}>{badge.text}</div>
              </div>

              {/* Arrow between cards */}
              {i < AGENTS.length - 1 && (
                <div className="pipeline-arrow" ref={(el) => (arrowRefs.current[i] = el)}>
                  <div className="arrow-track">
                    <div className="arrow-line" />
                    {i === 0
                      ? <div className="arrow-particle" ref={particle1} />
                      : <div className="arrow-particle" ref={particle2} />
                    }
                  </div>
                  <svg className="arrow-head" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M10 4L16 10L10 16" stroke="url(#ag)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="ag" x1="4" y1="10" x2="16" y2="10" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coder loop arrow */}
      <div className="loop-wrap" ref={loopRef}>
        <div className="loop-label">Loops once per file until all tasks are complete</div>
        <svg className="loop-svg" viewBox="0 0 400 60" fill="none">
          <path d="M360 12 Q360 48 200 48 Q40 48 40 12"
            stroke="url(#lg)" strokeWidth="2" strokeDasharray="8 5" fill="none" strokeLinecap="round"/>
          <polygon points="36,12 44,8 44,16" fill="#7C3AED" opacity="0.7"/>
          <defs>
            <linearGradient id="lg" x1="360" y1="12" x2="40" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" stopOpacity="0.8"/>
              <stop offset="1" stopColor="#06B6D4" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
