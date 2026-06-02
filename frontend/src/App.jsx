import { useState } from 'react';
import './App.css';

import Navbar    from './components/Navbar';
import Hero      from './components/Hero';
import Pipeline  from './components/Pipeline';
import Workspace from './components/Workspace';
import Footer    from './components/Footer';
import { useAgentSimulation } from './hooks/useAgentSimulation';

export default function App() {
  const [prompt, setPrompt] = useState('');

  const {
    status,
    agentStates,
    logs,
    plan,
    taskPlan,
    projectDir,
    generatedFiles,
    progress,
    run,
    clearAll,
  } = useAgentSimulation();

  const handleRun = (p) => {
    run(p);
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero
          prompt={prompt}
          setPrompt={setPrompt}
          onRun={handleRun}
          isRunning={status === 'running'}
        />
        <Pipeline agentStates={agentStates} />
        <Workspace
          agentStates={agentStates}
          logs={logs}
          plan={plan}
          taskPlan={taskPlan}
          projectDir={projectDir}
          generatedFiles={generatedFiles}
          progress={progress}
        />
      </main>
      <Footer />
    </>
  );
}
