import React from 'react'
import { Mail, Twitter, Github } from 'lucide-react'

const CTA_LINES = [
  { text: 'START BUILDING.', extraMargin: true },
  { text: 'DESCRIBE YOUR APP.', extraMargin: false },
  { text: 'WATCH IT CODE.', extraMargin: false },
  { text: 'SHIP THE FUTURE.', extraMargin: false },
]

interface IconBtnProps {
  children: React.ReactNode
  divider?: boolean
}

function IconBtn({ children, divider = false }: IconBtnProps) {
  return (
    <button
      className={`
        flex items-center justify-center text-cream hover:bg-white/10 transition-all duration-300
        w-[14vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem]
        h-[14vw] sm:h-[14.375rem] md:h-[10.78125rem] lg:h-[5rem]
        ${divider ? 'border-b border-white/10' : ''}
      `}
    >
      {children}
    </button>
  )
}

export default function CTASection() {
  return (
    <section id="cta" className="relative bg-background overflow-hidden">
      {/* Video — native aspect ratio, NOT object-cover */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center">
        {/* Heading Block — right aligned */}
        <div className="w-full max-w-[1831px] mx-auto px-6 sm:px-10 flex justify-end lg:pr-[20%] lg:pl-[15%]">
          <div className="relative text-right">
            {/* Cursive accent */}
            <span
              className="absolute -top-6 sm:-top-10 left-0 font-condiment text-[17px] sm:text-[28px] md:text-[44px] lg:text-[68px] text-neon mix-blend-exclusion opacity-90 -rotate-2 pointer-events-none"
            >
              just prompt it
            </span>

            {/* CTA Heading lines */}
            <div>
              {CTA_LINES.map(({ text, extraMargin }, i) => (
                <h2
                  key={i}
                  className={`font-grotesk text-[16px] sm:text-[28px] md:text-[44px] lg:text-[60px] uppercase text-cream leading-[1.05] ${
                    extraMargin ? 'mb-4 sm:mb-6 md:mb-8 lg:mb-12' : ''
                  }`}
                >
                  {text}
                </h2>
              ))}
            </div>
          </div>
        </div>

        {/* Social Icons — bottom-left absolute */}
        <div
          className="absolute left-[8%] bottom-[12%] sm:bottom-[14%] md:bottom-[16%] lg:bottom-[20%]"
        >
          <div className="liquid-glass rounded-[0.5rem] sm:rounded-[0.75rem] md:rounded-[1rem] lg:rounded-[1.25rem] overflow-hidden flex flex-col">
            <IconBtn divider><Mail size={20} /></IconBtn>
            <IconBtn divider><Twitter size={20} /></IconBtn>
            <IconBtn><Github size={20} /></IconBtn>
          </div>
        </div>
      </div>
    </section>
  )
}
