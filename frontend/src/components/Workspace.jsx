import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Workspace.css';

gsap.registerPlugin(ScrollTrigger);

const AGENT_META = {
  planner:   { emoji: '🧠', label: 'Planner',   idleMsg: 'Waiting for prompt…',   runMsg: 'Analyzing your prompt…',    doneMsg: 'Plan generated ✓' },
  architect: { emoji: '🏗️', label: 'Architect', idleMsg: 'Waiting for plan…',     runMsg: 'Designing task breakdown…', doneMsg: 'Tasks ready ✓'   },
  coder:     { emoji: '💻', label: 'Coder',     idleMsg: 'Waiting for tasks…',    runMsg: 'Implementing files…',       doneMsg: 'All files written ✓' },
};

function StatusRow({ id, state }) {
  const m = AGENT_META[id];
  const rowRef = useRef(null);
  const prevState = useRef('idle');

  useEffect(() => {
    if (state !== prevState.current) {
      gsap.from(rowRef.current, { x: -8, opacity: 0.5, duration: 0.35, ease: 'power2.out' });
      prevState.current = state;
    }
  }, [state]);

  const msg = state === 'running' ? m.runMsg : state === 'done' ? m.doneMsg : m.idleMsg;
  return (
    <div className={`status-row state-${state}`} ref={rowRef}>
      <div className="status-emoji">{m.emoji}</div>
      <div className="status-info">
        <span className="status-name">{m.label}</span>
        <span className="status-msg">{msg}</span>
      </div>
      <div className={`status-dot dot-${state}`} />
    </div>
  );
}

export default function Workspace({ agentStates, logs, plan, taskPlan, projectDir, generatedFiles, progress }) {
  const sectionRef  = useRef(null);
  const termRef     = useRef(null);
  const progressRef = useRef(null);
  const planRef     = useRef(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' or 'preview'

  const handlePreview = async () => {
    if (!projectDir) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/run-local/${projectDir}`, { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        setPreviewUrl(data.url);
        setActiveTab('preview');
      }
    } catch (e) {
      console.error("Preview failed", e);
    }
  };

  /* ── Scroll-triggered entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.workspace .section-tag, .workspace .section-title, .workspace .section-subtitle', {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.status-panel', {
        opacity: 0, x: -40, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      gsap.from('.terminal-panel', {
        opacity: 0, x: 40, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Auto-scroll terminal ── */
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs]);

  /* ── Progress bar animation ── */
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, { width: `${progress}%`, duration: 0.6, ease: 'power2.out' });
    }
  }, [progress]);

  /* ── Plan card reveal ── */
  useEffect(() => {
    if (plan && planRef.current) {
      gsap.from(planRef.current, { opacity: 0, y: 20, scale: 0.97, duration: 0.5, ease: 'back.out(1.5)' });
    }
  }, [plan]);

  /* ── File item pop-in ── */
  useEffect(() => {
    const items = document.querySelectorAll('.file-item:last-child');
    items.forEach((el) => gsap.from(el, { opacity: 0, x: -12, duration: 0.3, ease: 'power2.out' }));
  }, [generatedFiles]);

  const logColor = (type) => {
    switch (type) {
      case 'planner':   return 'log-purple';
      case 'architect': return 'log-cyan';
      case 'coder':     return 'log-green';
      case 'system':    return 'log-dim';
      case 'success':   return 'log-success';
      case 'spacer':    return 'log-spacer';
      default:          return '';
    }
  };

  return (
    <section id="workspace" className="workspace" ref={sectionRef}>
      <div className="section-header">
        <div className="section-tag">Live Workspace</div>
        <h2 className="section-title">Watch the Agents Work</h2>
        <p className="section-subtitle">Real-time output as each agent builds your project.</p>
      </div>

      <div className="workspace-grid">
        {/* ── Left: Status panel ── */}
        <div className="status-panel">
          <div className="panel-title">Agent Status</div>

          {['planner', 'architect', 'coder'].map((id) => (
            <StatusRow key={id} id={id} state={agentStates[id]} />
          ))}

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Overall Progress</span>
              <span className="progress-pct">{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" ref={progressRef} style={{ width: '0%' }} />
            </div>
          </div>

          {/* Plan info card */}
          {plan && (
            <div className="plan-card" ref={planRef}>
              <div className="plan-title">{plan.name}</div>
              <div className="plan-desc">{plan.description}</div>
              <div className="plan-meta">
                <span className="plan-badge">{plan.techstack}</span>
              </div>
              <div className="plan-features">
                {plan.features.map((f) => (
                  <div key={f} className="plan-feature">
                    <span className="plan-dot" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task plan from architect */}
          {taskPlan && taskPlan.length > 0 && (
            <div className="task-plan-section">
              <div className="files-title">🏗️ Architect Task Plan</div>
              <div className="task-list">
                {taskPlan.map((step, i) => (
                  <div key={i} className="task-item">
                    <button
                      className="task-header"
                      onClick={() => setExpandedTask(expandedTask === i ? null : i)}
                    >
                      <span className="task-index">{String(i + 1).padStart(2, '0')}</span>
                      <span className="task-filepath">{step.filepath}</span>
                      <span className="task-chevron">{expandedTask === i ? '▾' : '▸'}</span>
                    </button>
                    {expandedTask === i && (
                      <div className="task-desc">{step.task_description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          <div className="files-section">
            <div className="files-title">
              Generated Files
              {projectDir && (
                <span className="project-dir-badge" title={`Output: generated_projects/${projectDir}`}>
                  📁 {projectDir}
                </span>
              )}
            </div>
            <div className="files-list">
              {generatedFiles.length === 0
                ? <div className="files-empty">No files yet.</div>
                : generatedFiles.map((f) => (
                    <div key={f} className="file-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>{f}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Right: Terminal ── */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <div className="t-dots">
              <span className="t-dot t-red" />
              <span className="t-dot t-yellow" />
              <span className="t-dot t-green" />
            </div>
            <div className="t-tabs">
              <button 
                className={`t-tab ${activeTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminal')}
              >
                agent.log
              </button>
              {projectDir && (
                <button 
                  className={`t-tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={previewUrl ? () => setActiveTab('preview') : handlePreview}
                >
                  Live Preview ▶
                </button>
              )}
            </div>
          </div>

          <div className="terminal-body" ref={termRef} style={{ display: activeTab === 'terminal' ? 'block' : 'none' }}>
            {logs.length === 0 ? (
              <div className="terminal-welcome">
                <pre className="ascii-art">{`
  ██████╗ ██████╗ ██████╗ ███████╗██████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗
  ██║     ██║   ██║██║  ██║█████╗  ██████╔╝
  ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗
  ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
  ██████╗ ██╗   ██╗██████╗ ██████╗ ██╗   ██╗
  ██╔══██╗██║   ██║██╔══██╗██╔══██╗╚██╗ ██╔╝
  ██████╔╝██║   ██║██║  ██║██║  ██║ ╚████╔╝
  ██╔══██╗██║   ██║██║  ██║██║  ██║  ╚██╔╝
  ██████╔╝╚██████╔╝██████╔╝██████╔╝   ██║
  ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝`}</pre>
                <p className="welcome-sub">v1.0 — Multi-Agent LangGraph Engineering Assistant</p>
                <p className="welcome-hint">Enter a prompt above and click <strong>Generate Project</strong> to start.</p>
              </div>
            ) : (
              logs.map((entry, i) => (
                entry.type === 'spacer'
                  ? <div key={i} className="log-spacer" />
                  : (
                    <div key={i} className={`log-line ${logColor(entry.type)}`}>
                      <span className="log-ts">{entry.ts}</span>
                      <span className="log-text">{entry.line}</span>
                    </div>
                  )
              ))
            )}
          </div>

          {activeTab === 'preview' && (
            <div className="preview-body">
              <iframe src={previewUrl} title="Live Preview" className="preview-iframe" sandbox="allow-scripts allow-same-origin" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
