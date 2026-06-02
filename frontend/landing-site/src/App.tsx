import React from 'react'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import CollectionSection from './components/CollectionSection'
import PromptSection from './components/PromptSection'
import WorkspaceSection from './components/WorkspaceSection'
import CTASection from './components/CTASection'
import { useAgentRun } from './hooks/useAgentRun'

export default function App() {
  const { status, agentStates, logs, plan, taskPlan, projectDir, generatedFiles, progress, isSimulated, run, clearAll } = useAgentRun()

  return (
    <div className="bg-background text-cream min-h-screen relative">
      {/* Full-screen fixed grain/noise texture overlay using SVG feTurbulence */}
      <svg
        className="fixed inset-0 w-full h-full z-50 pointer-events-none"
        style={{ mixBlendMode: 'lighten' as React.CSSProperties['mixBlendMode'], opacity: 0.35 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise-filter" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.72}
            numOctaves={4}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>

      {/* Page sections */}
      <HeroSection />
      <AboutSection />
      <CollectionSection />

      {/* Live pipeline interaction */}
      <PromptSection status={status} onRun={run} onClear={clearAll} />
      <WorkspaceSection
        status={status}
        agentStates={agentStates}
        logs={logs}
        plan={plan}
        taskPlan={taskPlan}
        projectDir={projectDir}
        generatedFiles={generatedFiles}
        progress={progress}
        isSimulated={isSimulated}
      />

      <CTASection />
    </div>
  )
}
