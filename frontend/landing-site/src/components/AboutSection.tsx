import React from 'react'

const ABOUT_DESC =
  'A natural language prompt becomes a complete, working project — file by file — using real developer workflows powered by LangGraph.'

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/55 pointer-events-none" />

      <div className="relative z-10 max-w-[1831px] mx-auto w-full px-6 sm:px-10 py-16 sm:py-24">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-0 mb-20 lg:mb-32">
          {/* Left: Heading */}
          <div className="relative inline-block">
            <h2
              className="font-grotesk text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] uppercase text-cream leading-[1]"
            >
              Hello!
              <br />
              I'm CodeVerse,
              <br />
              your AI coding companion.
            </h2>
            {/* Cursive accent */}
            <span
              className="absolute -bottom-4 right-0 font-condiment text-[36px] sm:text-[50px] md:text-[60px] lg:text-[68px] text-neon rotate-1 mix-blend-exclusion opacity-90 pointer-events-none"
            >
              Buddy
            </span>
          </div>

          {/* Right: Description */}
          <p className="font-mono text-[14px] sm:text-[16px] uppercase text-cream max-w-[266px] leading-relaxed lg:mt-4">
            {ABOUT_DESC}
          </p>
        </div>

        {/* Bottom Row — decorative repeated ghost text */}
        <div className="flex justify-between items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6 max-w-sm">
            <p className="font-mono text-[13px] uppercase text-cream opacity-10">
              {ABOUT_DESC}
            </p>
            <p className="font-mono text-[13px] uppercase text-cream opacity-10">
              {ABOUT_DESC}
            </p>
          </div>

          {/* Right column — hidden on mobile */}
          <div className="hidden lg:flex flex-col gap-6 max-w-sm text-right">
            <p className="font-mono text-[13px] uppercase text-[#010828] lg:text-cream opacity-10">
              {ABOUT_DESC}
            </p>
            <p className="font-mono text-[13px] uppercase text-[#010828] lg:text-cream opacity-10">
              {ABOUT_DESC}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
