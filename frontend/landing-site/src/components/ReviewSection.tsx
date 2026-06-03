import React, { useState, useEffect, useRef } from 'react'
import { PlanData, RunStatus } from '../hooks/useAgentRun'

interface Props {
  status: RunStatus
  review: string | null
  plan: PlanData | null
}

function parseReviewSections(raw: string) {
  const lines = raw.split('\n')
  const sections: { heading: string; body: string[] }[] = []
  let current: { heading: string; body: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith('#')) {
      if (current) sections.push(current)
      current = { heading: line.replace(/^#+\s*/, ''), body: [] }
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) sections.push(current)

  // If no markdown headings, return as single block
  if (sections.length === 0) {
    return [{ heading: 'Review', body: raw.split('\n') }]
  }
  return sections
}

const SECTION_ICONS: Record<string, string> = {
  completeness: '◎',
  'code quality': '◈',
  'potential issues': '◉',
  summary: '◆',
}

function getIcon(heading: string) {
  const key = heading.toLowerCase()
  for (const [k, v] of Object.entries(SECTION_ICONS)) {
    if (key.includes(k)) return v
  }
  return '◇'
}

export default function ReviewSection({ status, review, plan }: Props) {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Animate in when review arrives
  useEffect(() => {
    if (review) {
      const t = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [review])

  // Auto-scroll into view when it appears
  useEffect(() => {
    if (visible && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [visible])

  if (status === 'idle') return null

  const sections = review ? parseReviewSections(review) : []

  return (
    <section
      ref={sectionRef}
      className="bg-background py-20 sm:py-28 relative overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Neon right glow */}
      <div
        className="absolute right-0 top-1/3 w-[500px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right, rgba(111,255,0,0.05) 0%, transparent 70%)' }}
      />
      {/* Subtle top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

      <div className="max-w-[1831px] mx-auto px-6 sm:px-10 relative z-10">

        {/* Heading */}
        <div className="mb-14">
          <h2 className="font-grotesk text-[32px] sm:text-[52px] lg:text-[68px] uppercase text-cream leading-[1]">
            Code
          </h2>
          <div className="ml-12 sm:ml-24 lg:ml-40 flex items-end gap-6">
            <span className="font-condiment text-[32px] sm:text-[52px] lg:text-[68px] text-neon">Review</span>
            {plan?.name && (
              <span className="font-mono text-[11px] text-cream/30 uppercase tracking-widest mb-3 hidden sm:block">
                — {plan.name}
              </span>
            )}
          </div>
        </div>

        {!review ? (
          /* Waiting for reviewer agent */
          <div className="liquid-glass rounded-[28px] p-8 max-w-2xl flex items-center gap-5">
            <div className="flex gap-1.5 flex-shrink-0">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-neon/60"
                  style={{
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div>
              <p className="font-mono text-[12px] text-cream/50 uppercase tracking-widest">
                {status === 'running' ? 'Reviewer agent working…' : 'Waiting for review…'}
              </p>
              <p className="font-mono text-[11px] text-cream/25 mt-1">
                Review will appear here once the coder finishes
              </p>
            </div>
          </div>
        ) : sections.length > 1 ? (
          /* Multi-section tabbed layout */
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

            {/* Left nav */}
            <div className="flex flex-col gap-2">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all duration-300 group ${activeSection === i
                      ? 'bg-neon/10 border border-neon/30'
                      : 'border border-white/5 hover:border-white/15 hover:bg-white/5'
                    }`}
                >
                  <span
                    className={`font-mono text-[18px] flex-shrink-0 transition-colors ${activeSection === i ? 'text-neon' : 'text-cream/25 group-hover:text-cream/50'
                      }`}
                  >
                    {getIcon(sec.heading)}
                  </span>
                  <div>
                    <div
                      className={`font-mono text-[11px] uppercase tracking-widest transition-colors ${activeSection === i ? 'text-neon' : 'text-cream/50 group-hover:text-cream/70'
                        }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div
                      className={`font-grotesk text-[13px] uppercase transition-colors ${activeSection === i ? 'text-cream' : 'text-cream/50 group-hover:text-cream/80'
                        }`}
                    >
                      {sec.heading}
                    </div>
                  </div>
                  {activeSection === i && (
                    <span className="ml-auto font-mono text-neon text-[10px]">▶</span>
                  )}
                </button>
              ))}

              {/* Section counter */}
              <div className="mt-4 px-5">
                <div className="h-px bg-white/10 mb-4" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cream/25 uppercase tracking-widest">Sections</span>
                  <span className="font-mono text-[10px] text-neon">{sections.length} total</span>
                </div>
              </div>
            </div>

            {/* Right content panel */}
            <div className="liquid-glass rounded-[28px] overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[20px] text-neon">{getIcon(sections[activeSection].heading)}</span>
                  <div>
                    <span className="font-mono text-[10px] text-cream/30 uppercase tracking-widest block">
                      {String(activeSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                    </span>
                    <span className="font-grotesk text-[16px] uppercase text-cream">
                      {sections[activeSection].heading}
                    </span>
                  </div>
                </div>
                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSection(i => Math.max(0, i - 1))}
                    disabled={activeSection === 0}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-[12px] text-cream/50 hover:border-neon/40 hover:text-neon disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveSection(i => Math.min(sections.length - 1, i + 1))}
                    disabled={activeSection === sections.length - 1}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-mono text-[12px] text-cream/50 hover:border-neon/40 hover:text-neon disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8">
                <div className="font-mono text-[13px] text-cream/75 leading-[1.9] space-y-2">
                  {sections[activeSection].body
                    .filter(line => line.trim() !== '')
                    .map((line, i) => {
                      // Bold inline **text**
                      const formatted = line.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-cream font-bold">$1</strong>'
                      )
                      // Bullet points
                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-neon mt-1 flex-shrink-0 text-[8px]">▪</span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: formatted.replace(/^[-•]\s*/, ''),
                              }}
                            />
                          </div>
                        )
                      }
                      return (
                        <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
                      )
                    })}
                </div>
              </div>

              {/* Dot navigation */}
              <div className="flex items-center justify-center gap-2 pb-6">
                {sections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSection(i)}
                    className={`rounded-full transition-all duration-300 ${activeSection === i
                        ? 'w-6 h-1.5 bg-neon shadow-[0_0_8px_rgba(111,255,0,0.5)]'
                        : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Single block fallback (no headings) */
          <div className="liquid-glass rounded-[28px] p-6 sm:p-10 max-w-4xl">
            <div
              className="font-mono text-[13px] text-cream/75 leading-[1.9] overflow-hidden transition-all duration-500"
              style={{ maxHeight: isExpanded ? '9999px' : '320px' }}
            >
              {review.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-3' : ''}>{line}</p>
              ))}
            </div>
            <button
              onClick={() => setIsExpanded(e => !e)}
              className="mt-4 font-mono text-[11px] uppercase text-neon/70 hover:text-neon tracking-widest transition-colors"
            >
              {isExpanded ? '▲ Show less' : '▼ Show more'}
            </button>
          </div>
        )}

        {/* Bottom metadata strip — only when review is present */}
        {review && (
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_rgba(111,255,0,0.5)]" />
              <span className="font-mono text-[11px] text-cream/40 uppercase tracking-widest">Review complete</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="font-mono text-[11px] text-cream/25 uppercase tracking-widest">
              Reviewer — llama-3.3-70b
            </span>
            {plan?.techstack && (
              <>
                <div className="h-3 w-px bg-white/10" />
                <span className="font-mono text-[11px] text-neon/40 uppercase tracking-widest">{plan.techstack}</span>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}