import React, { useState } from 'react'
import { RunStatus } from '../hooks/useAgentRun'

const EXAMPLES = [
  { label: 'To-Do App', prompt: 'Create a colourful modern to-do list app in HTML, CSS and JavaScript' },
  { label: 'Calculator', prompt: 'Build a simple calculator web app with HTML, CSS and JavaScript' },
  { label: 'FastAPI Blog', prompt: 'Create a blog REST API in FastAPI with a SQLite database' },
  { label: 'Weather App', prompt: 'Build a weather dashboard with charts using HTML, CSS, JS and Chart.js' },
]

interface Props {
  status: RunStatus
  onRun: (prompt: string) => void
  onClear: () => void
}

export default function PromptSection({ status, onRun, onClear }: Props) {
  const [prompt, setPrompt] = useState('')
  const isRunning = status === 'running'

  const handleRun = () => {
    if (!prompt.trim() || isRunning) return
    onRun(prompt.trim())
    // scroll to workspace
    setTimeout(() => {
      document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <section
      id="prompt"
      className="bg-background py-20 sm:py-28 relative overflow-hidden"
    >
      {/* Neon glow blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(111,255,0,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-[1831px] mx-auto px-6 sm:px-10 relative z-10">
        {/* Heading */}
        <div className="mb-12">
          <h2 className="font-grotesk text-[32px] sm:text-[52px] lg:text-[68px] uppercase text-cream leading-[1]">
            Prompt the
          </h2>
          <div className="ml-12 sm:ml-24 lg:ml-40">
            <span className="font-condiment text-[32px] sm:text-[52px] lg:text-[68px] text-neon">
              pipeline{' '}
            </span>
          </div>
        </div>

        {/* Prompt box */}
        <div className="liquid-glass rounded-[28px] p-6 sm:p-8 max-w-4xl">
          {/* Label row */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] uppercase text-cream/50 tracking-widest">
              &gt; Your project prompt
            </span>
            {(status === 'done' || status === 'error') && (
              <button
                onClick={onClear}
                className="font-mono text-[11px] uppercase text-cream/40 hover:text-neon transition-colors duration-200 tracking-widest"
              >
                [ clear ]
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            id="user-prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun() }}
            disabled={isRunning}
            placeholder="e.g. Create a to-do list app with HTML, CSS, and JavaScript…"
            rows={4}
            className="w-full bg-transparent resize-none outline-none font-mono text-[14px] sm:text-[16px] text-cream placeholder-cream/20 leading-relaxed"
          />

          {/* Footer row */}
          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Example chips */}
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => setPrompt(ex.prompt)}
                  className="font-mono text-[10px] uppercase text-cream/50 border border-white/10 rounded-full px-3 py-1 hover:border-neon/50 hover:text-neon transition-all duration-200"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              id="generate-btn"
              onClick={handleRun}
              disabled={!prompt.trim() || isRunning}
              className="flex-shrink-0 flex items-center gap-3 font-grotesk text-[14px] sm:text-[16px] uppercase tracking-wider px-7 py-4 rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isRunning
                  ? 'rgba(111,255,0,0.08)'
                  : 'linear-gradient(135deg, #6FFF00 0%, #4ac600 100%)',
                color: isRunning ? '#6FFF00' : '#010828',
                boxShadow: !isRunning && prompt.trim()
                  ? '0 0 32px rgba(111,255,0,0.25)'
                  : 'none',
              }}
            >
              {isRunning ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-neon border-t-transparent animate-spin"
                    aria-hidden
                  />
                  Running…
                </>
              ) : (
                <>
                  Generate
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kbd hint */}
        <p className="mt-4 font-mono text-[11px] text-cream/20 uppercase tracking-widest">
          Tip — press Ctrl+Enter to generate
        </p>
      </div>
    </section>
  )
}
