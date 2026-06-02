import React from 'react'
import { Mail, Twitter, Github } from 'lucide-react'

const NAV_LINKS = ['Home', 'How It Works', 'Agents', 'Docs', 'GitHub']

const SocialBtn = ({ children }: { children: React.ReactNode }) => (
  <button className="liquid-glass rounded-[1rem] w-14 h-14 flex items-center justify-center text-cream hover:bg-white/10 transition-all duration-300">
    {children}
  </button>
)

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden rounded-b-[32px]"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8 max-w-[1831px] mx-auto w-full">
        {/* Logo */}
        <span className="font-grotesk text-[16px] uppercase text-cream tracking-widest">
          Jarvis Buddy
        </span>

        {/* Desktop Nav */}
        <nav className="hidden lg:block liquid-glass rounded-[28px] px-[52px] py-[24px]">
          <ul className="flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="font-grotesk text-[13px] uppercase text-cream hover:text-neon transition-colors duration-300"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Social Icons */}
        <div className="hidden lg:flex flex-col gap-3">
          <SocialBtn><Mail size={20} /></SocialBtn>
          <SocialBtn><Twitter size={20} /></SocialBtn>
          <SocialBtn><Github size={20} /></SocialBtn>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-10 max-w-[1831px] mx-auto w-full py-16">
        <div className="lg:ml-32 max-w-[780px]">
          {/* Main Heading */}
          <div className="relative inline-block">
            <h1
              className="font-grotesk text-[40px] sm:text-[60px] md:text-[75px] lg:text-[90px] uppercase text-cream leading-[1.05] sm:leading-[1]"
            >
              Build anything
              <br />
              with ( your )
              <br />
              AI agent
              <br />
              dev team
            </h1>

            {/* Cursive accent */}
            <span
              className="absolute -right-4 sm:right-0 top-1/4 font-condiment text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] text-neon -rotate-1 mix-blend-exclusion opacity-90 pointer-events-none whitespace-nowrap"
            >
              Multi-agent
            </span>
          </div>

          {/* Mobile Social Icons */}
          <div className="flex lg:hidden gap-3 mt-8">
            <SocialBtn><Mail size={20} /></SocialBtn>
            <SocialBtn><Twitter size={20} /></SocialBtn>
            <SocialBtn><Github size={20} /></SocialBtn>
          </div>
        </div>
      </div>
    </section>
  )
}
