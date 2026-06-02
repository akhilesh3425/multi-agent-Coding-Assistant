import React from 'react'

interface AgentCard {
  videoUrl: string
  agentName: string
  agentLabel: string
  llmName: string
  role: string
  description: string
  tag: string
}

const agentCards: AgentCard[] = [
  {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4',
    agentName: 'Planner',
    agentLabel: 'AGENT 01',
    llmName: 'llama-3.3-70b-versatile',
    role: 'Project Architect',
    description: 'Parses your prompt and generates a complete structured engineering plan with tech stack, features, and file list.',
    tag: 'PLAN',
  },
  {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4',
    agentName: 'Architect',
    agentLabel: 'AGENT 02',
    llmName: 'llama-3.3-70b-versatile',
    role: 'Task Engineer',
    description: 'Breaks the plan into self-contained implementation tasks — with imports, signatures, and dependency ordering.',
    tag: 'DESIGN',
  },
  {
    videoUrl:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4',
    agentName: 'Coder',
    agentLabel: 'AGENT 03',
    llmName: 'Qwen/qwen3-32b',
    role: 'Code Executor',
    description: 'Executes each task using real file-system tools — reads, writes, and integrates every module like a real developer.',
    tag: 'BUILD',
  },
]

function AgentCard({ videoUrl, agentName, agentLabel, llmName, role, description, tag }: AgentCard) {
  return (
    <div className="liquid-glass rounded-[32px] p-[18px] hover:bg-white/10 transition-all duration-300 group flex flex-col">
      {/* Square Video Container */}
      <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
        />
        {/* Agent label badge */}
        <div className="absolute top-4 left-4 liquid-glass rounded-[12px] px-3 py-2">
          <div className="flex flex-col gap-1">
            <span className="font-grotesk text-[11px] text-cream/80 uppercase tracking-widest">
              {agentLabel}
            </span>
            <span className="font-mono text-[10px] text-cream/70 uppercase tracking-widest">
              {llmName}
            </span>
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="mt-4 flex-1 flex flex-col gap-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-grotesk text-[22px] uppercase text-cream leading-none">
              {agentName}
            </h3>
            <p className="font-condiment text-[18px] text-neon mt-0.5">{role}</p>
          </div>
          <span className="font-grotesk text-[11px] text-neon border border-neon/40 rounded-full px-3 py-1 uppercase tracking-widest flex-shrink-0 mt-1">
            {tag}
          </span>
        </div>
        <p className="font-mono text-[12px] text-cream/60 uppercase leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="liquid-glass rounded-[20px] px-5 py-4 mt-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-cream/70 uppercase tracking-wider">
            Pipeline Step:
          </p>
          <p className="font-grotesk text-[16px] text-cream uppercase mt-0.5">
            {agentLabel}
          </p>
        </div>

        {/* Purple CTA button */}
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 shadow-lg shadow-purple-500/50"
          style={{
            background: 'linear-gradient(135deg, #b724ff 0%, #7c3aed 100%)',
          }}
          aria-label={`View ${agentName} agent`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function AgentsSection() {
  const handleExplorePipeline = () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="agents"
      className="bg-background py-20 sm:py-28"
    >
      <div className="max-w-[1831px] mx-auto px-6 sm:px-10">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          {/* Left Heading */}
          <div>
            <h2
              className="font-grotesk text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] uppercase text-cream leading-[1]"
            >
              Meet the
            </h2>
            <div className="ml-12 sm:ml-24 lg:ml-32">
              <span className="font-condiment text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] text-neon">
                AI{' '}
              </span>
              <span className="font-grotesk text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] uppercase text-cream">
                agents
              </span>
            </div>
          </div>

          {/* Right — Explore Pipeline button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              id="explore-pipeline"
              className="group relative text-left rounded-full border border-neon/20 p-5 transition-all duration-300 hover:border-neon/40 hover:bg-white/5"
              onClick={handleExplorePipeline}
              aria-label="See the LangGraph pipeline"
              title="Scroll to the live LangGraph pipeline section to inspect Planner → Architect → Coder execution."
            >
              <div className="flex items-end gap-3">
                <span className="font-grotesk text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] uppercase text-cream leading-none">
                  SEE
                </span>
                <div className="flex flex-col leading-none mb-1">
                  <span className="font-grotesk text-[20px] sm:text-[28px] md:text-[32px] lg:text-[36px] uppercase text-neon">
                    LANGGRAPH
                  </span>
                  <span className="font-grotesk text-[20px] sm:text-[28px] md:text-[32px] lg:text-[36px] uppercase text-cream">
                    PIPELINE
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2 items-center text-[10px] uppercase tracking-widest font-mono">
                {['Start', 'Planner', 'Architect', 'Coder', 'End'].map((step, index) => (
                  <React.Fragment key={step}>
                    <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-2 text-cream">
                      {step}
                    </span>
                    {index < 4 && (
                      <span className="text-neon">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-4 h-[6px] sm:h-[8px] lg:h-[10px] w-full bg-neon rounded-full" />
              <div className="pointer-events-none absolute left-1/2 bottom-[-3.75rem] w-[280px] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 px-3 py-2 text-[11px] text-cream/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                View the internal LangGraph execution flow between Planner, Architect, and Coder.
              </div>
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentCards.map((card, i) => (
            <AgentCard key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
