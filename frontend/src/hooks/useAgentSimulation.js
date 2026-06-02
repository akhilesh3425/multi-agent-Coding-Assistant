import { useState, useRef, useCallback } from 'react';

/**
 * useAgentRun — connects to the real FastAPI SSE backend at /api/run.
 *
 * Drop-in replacement for the old useAgentSimulation hook.
 * Returns the same shape: { status, agentStates, logs, plan, generatedFiles, progress, run, clearAll }
 */
export function useAgentSimulation() {
  const [status, setStatus]               = useState('idle');   // idle | running | done | error
  const [agentStates, setAgentStates]     = useState({ planner: 'idle', architect: 'idle', coder: 'idle' });
  const [logs, setLogs]                   = useState([]);
  const [plan, setPlan]                   = useState(null);
  const [taskPlan, setTaskPlan]           = useState(null);   // architect output
  const [projectDir, setProjectDir]       = useState(null);   // per-run output folder name
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [progress, setProgress]           = useState(0);
  const abortRef                          = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const ts = () => new Date().toLocaleTimeString();

  const addLog = useCallback((line, type = 'info') => {
    setLogs(prev => [...prev, { line, type, ts: ts() }]);
  }, []);

  const clearAll = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setStatus('idle');
    setAgentStates({ planner: 'idle', architect: 'idle', coder: 'idle' });
    setLogs([]);
    setPlan(null);
    setTaskPlan(null);
    setProjectDir(null);
    setGeneratedFiles([]);
    setProgress(0);
  }, []);

  // ── Agent → log-type mapping ───────────────────────────────────────────────

  const agentType = (agent) => {
    switch (agent) {
      case 'planner':   return 'planner';
      case 'architect': return 'architect';
      case 'coder':     return 'coder';
      case 'reviewer':  return 'coder';
      case 'success':   return 'success';
      default:          return 'system';
    }
  };

  // ── Progress heuristic based on which agents have finished ─────────────────

  const progressForDoneAgents = (states) => {
    const order = ['planner', 'architect', 'coder'];
    const doneCount = order.filter(a => states[a] === 'done').length;
    return Math.round((doneCount / order.length) * 95);
  };

  // ── Main run function ──────────────────────────────────────────────────────

  const run = useCallback(async (prompt) => {
    clearAll();
    setStatus('running');

    const controller = new AbortController();
    abortRef.current = controller;

    let localAgentStates = { planner: 'idle', architect: 'idle', coder: 'idle' };

    const updateAgent = (agent, state) => {
      localAgentStates = { ...localAgentStates, [agent]: state };
      setAgentStates({ ...localAgentStates });
      setProgress(progressForDoneAgents(localAgentStates));
    };

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        addLog(`Error ${response.status}: ${text}`, 'system');
        setStatus('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // ── SSE event dispatcher ───────────────────────────────────────────────
      function handleEvent(event, data) {
        switch (event) {
          case 'agent_start':
            if (['planner', 'architect', 'coder'].includes(data.agent)) {
              updateAgent(data.agent, 'running');
            }
            break;

          case 'agent_done':
            if (['planner', 'architect', 'coder'].includes(data.agent)) {
              updateAgent(data.agent, 'done');
              setLogs(prev => [...prev, { line: '', type: 'spacer', ts: ts() }]);
            }
            break;

          case 'log':
            addLog(data.line, agentType(data.agent));
            break;

          case 'task_plan':
            setTaskPlan(data.steps);   // [{filepath, task_description}, ...]
            break;

          case 'project_dir':
            setProjectDir(data.path);
            break;

          case 'plan':
            setPlan({
              name: data.name,
              description: data.description,
              techstack: data.techstack,
              features: data.features,
              files: data.files,
            });
            break;

          case 'file_written':
            setGeneratedFiles(prev => [...prev, data.path]);
            break;

          case 'done':
            setProgress(100);
            setStatus('done');
            break;

          case 'error':
            addLog(`Error: ${data.message}`, 'system');
            setStatus('error');
            break;

          default:
            break;
        }
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line

        let eventName = 'message';
        for (const raw of lines) {
          if (raw.startsWith('event:')) {
            eventName = raw.slice(6).trim();
          } else if (raw.startsWith('data:')) {
            try {
              const payload = JSON.parse(raw.slice(5).trim());
              handleEvent(eventName, payload);
            } catch (parseErr) {
              console.warn('[SSE] Failed to parse data line:', raw, parseErr);
            }
            eventName = 'message'; // reset after each data line
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`Connection error: ${err.message}`, 'system');
        setStatus('error');
      }
    }
  }, [clearAll, addLog]);

  return { status, agentStates, logs, plan, taskPlan, projectDir, generatedFiles, progress, run, clearAll };
}
