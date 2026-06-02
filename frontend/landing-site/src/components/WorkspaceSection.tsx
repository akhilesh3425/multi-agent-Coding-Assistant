import React, { useEffect, useRef, useState } from 'react'
import { AgentId, AgentStatus, LogEntry, PlanData, RunStatus, TaskStep } from '../hooks/useAgentRun'

const AGENT_META: Record<AgentId, { label: string; step: string }> = {
  planner:   { label: 'Planner',   step: 'PLAN'   },
  architect: { label: 'Architect', step: 'DESIGN' },
  coder:     { label: 'Coder',     step: 'BUILD'  },
}

const LOG_COLOR: Record<string, string> = {
  planner:   'text-purple-400',
  architect: 'text-cyan-400',
  coder:     'text-neon',
  reviewer:  'text-neon',
  success:   'text-neon',
  system:    'text-cream/30',
}

interface Props {
  status: RunStatus
  agentStates: Record<AgentId, AgentStatus>
  logs: LogEntry[]
  plan: PlanData | null
  taskPlan: TaskStep[] | null
  projectDir: string | null
  generatedFiles: string[]
  progress: number
  isSimulated: boolean
}

function AgentRow({ id, state }: { id: AgentId; state: AgentStatus }) {
  const m = AGENT_META[id]
  const dotColor =
    state === 'running' ? 'bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.5)]'
    : state === 'done'  ? 'bg-neon   shadow-[0_0_8px_2px_rgba(111,255,0,0.4)]'
    :                     'bg-white/20'

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-500 ${dotColor}`} />
        <span className="font-grotesk text-[15px] uppercase text-cream">{m.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-cream/30 uppercase tracking-widest">
          {state === 'running' ? 'working…' : state === 'done' ? 'done ✓' : 'waiting'}
        </span>
        <span className="font-grotesk text-[10px] text-neon border border-neon/30 rounded-full px-2.5 py-0.5 uppercase tracking-widest">
          {m.step}
        </span>
      </div>
    </div>
  )
}

export default function WorkspaceSection({
  status, agentStates, logs, plan, taskPlan, projectDir, generatedFiles, progress, isSimulated,
}: Props) {
  const termRef = useRef<HTMLDivElement>(null)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRunningLocal, setIsRunningLocal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMockApiExplorer, setShowMockApiExplorer] = useState(false)
  const [mockApiResponse, setMockApiResponse] = useState<string>('Click an endpoint on the left to invoke simulated API...')

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [logs])

  const handleDownloadZip = async () => {
    if (!projectDir && !isSimulated) return
    setIsDownloading(true)
    try {
      if (isSimulated) {
        // Build simulated file contents
        const files: Record<string, string> = {}
        const lower = (plan?.name || '').toLowerCase()
        
        if (lower.includes('calc') || lower.includes('calculator')) {
          files['index.html'] = getCalculatorSimulatedHtml()
          files['styles.css'] = `/* styles.css is embedded in index.html for preview but provided separately here */`
          files['script.js'] = `// script.js is embedded in index.html for preview but provided separately here`
        } else if (lower.includes('blog') || lower.includes('api')) {
          files['main.py'] = `# main.py\n# FastAPI application\nfrom fastapi import FastAPI\napp = FastAPI()\n@app.get("/posts")\ndef get_posts():\n    return [{"id": 1, "title": "Mock Post"}]`
          files['models.py'] = `# models.py\nfrom pydantic import BaseModel\nclass Post(BaseModel):\n    id: int\n    title: str`
          files['database.py'] = `# database.py\n# database settings`
          files['auth.py'] = `# auth.py\n# JWT authentication`
        } else {
          files['index.html'] = getTodoSimulatedHtml()
          files['styles.css'] = `/* styles.css is embedded in index.html for preview but provided separately here */`
          files['script.js'] = `// script.js is embedded in index.html for preview but provided separately here`
        }
        
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        Object.entries(files).forEach(([name, content]) => {
          zip.file(name, content)
        })
        const blob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(plan?.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.zip`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Trigger backend download
        window.open(`/api/download-zip/${projectDir}`, '_blank')
      }
    } catch (err) {
      console.error('Failed to download project:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleRunLocally = async () => {
    if (isSimulated) {
      setIsRunningLocal(true)
      await new Promise(r => setTimeout(r, 800))
      
      const lower = (plan?.name || '').toLowerCase()
      if (lower.includes('blog') || lower.includes('api')) {
        setShowMockApiExplorer(true)
        setPreviewUrl(null)
      } else {
        // Construct simulated preview iframe
        let html = ''
        if (lower.includes('calc') || lower.includes('calculator')) {
          html = getCalculatorSimulatedHtml()
        } else {
          html = getTodoSimulatedHtml()
        }
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setShowMockApiExplorer(false)
      }
      setShowPreview(true)
      setIsRunningLocal(false)
    } else {
      setIsRunningLocal(true)
      try {
        const res = await fetch(`/api/run-local/${projectDir}`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          // For simple HTML/JS/CSS apps, also load preview inside iframe!
          const filesRes = await fetch(`/api/project-files/${projectDir}`)
          if (filesRes.ok) {
            const filesData = await filesRes.json()
            const files = filesData.files
            if (files['index.html']) {
              // Combine and show preview
              let combinedHtml = files['index.html']
              const css = files['styles.css'] || ''
              const js = files['script.js'] || ''
              if (css) combinedHtml = combinedHtml.replace('</head>', `<style>${css}</style></head>`)
              if (js) combinedHtml = combinedHtml.replace('</body>', `<script>${js}</script></body>`)
              
              const blob = new Blob([combinedHtml], { type: 'text/html' })
              const url = URL.createObjectURL(blob)
              setPreviewUrl(url)
              setShowPreview(true)
            }
          }
        }
      } catch (err) {
        console.error('Failed to run locally:', err)
      } finally {
        setIsRunningLocal(false)
      }
    }
  }

  const handleMockApiCall = (action: string) => {
    switch (action) {
      case 'GET_POSTS':
        setMockApiResponse(`// GET /posts\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n[\n  {\n    "id": 1,\n    "title": "Welcome to my Coder Buddy blog!",\n    "content": "This backend was generated completely by an AI agent.",\n    "created_at": "${new Date().toISOString()}"\n  }\n]`)
        break;
      case 'CREATE_POST':
        setMockApiResponse(`// POST /posts\nHTTP/1.1 201 Created\nContent-Type: application/json\n\n{\n  "id": 2,\n  "title": "New generated post",\n  "content": "API endpoints are fully functional and secure.",\n  "created_at": "${new Date().toISOString()}"\n}`)
        break;
      case 'GET_POST_1':
        setMockApiResponse(`// GET /posts/1\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 1,\n  "title": "Welcome to my Coder Buddy blog!",\n  "content": "This backend was generated completely by an AI agent.",\n  "created_at": "${new Date().toISOString()}"\n}`)
        break;
    }
  }

  if (status === 'idle') return null

  return (
    <section
      id="workspace"
      className="bg-background py-20 sm:py-28 relative"
    >
      {/* Neon left glow */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at left, rgba(111,255,0,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1831px] mx-auto px-6 sm:px-10 relative z-10">
        {/* Heading */}
        <div className="mb-12">
          <h2 className="font-grotesk text-[32px] sm:text-[52px] lg:text-[68px] uppercase text-cream leading-[1]">
            Watch the
          </h2>
          <div className="ml-12 sm:ml-24 lg:ml-40">
            <span className="font-condiment text-[32px] sm:text-[52px] lg:text-[68px] text-neon">agents work</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-10 max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase text-cream/40 tracking-widest">Overall Progress</span>
            <span className="font-mono text-[11px] text-neon">{progress}%</span>
          </div>
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(111,255,0,0.5)' }}
            />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Agent status + plan */}
          <div className="flex flex-col gap-6">
            {/* Agent status panel */}
            <div className="liquid-glass rounded-[28px] p-6">
              <p className="font-mono text-[11px] uppercase text-cream/40 tracking-widest mb-4">Agent Status</p>
              {(['planner', 'architect', 'coder'] as AgentId[]).map(id => (
                <AgentRow key={id} id={id} state={agentStates[id]} />
              ))}
            </div>

            {/* Plan card */}
            {plan && (
              <div className="liquid-glass rounded-[28px] p-6">
                <p className="font-mono text-[11px] uppercase text-cream/40 tracking-widest mb-3">Generated Plan</p>
                <h3 className="font-grotesk text-[22px] uppercase text-cream mb-1">{plan.name}</h3>
                <p className="font-mono text-[12px] text-cream/50 uppercase leading-relaxed mb-4">{plan.description}</p>
                <span className="font-mono text-[10px] text-neon border border-neon/30 rounded-full px-3 py-1 uppercase tracking-widest">
                  {plan.techstack}
                </span>
                <div className="mt-4 flex flex-col gap-1.5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-neon flex-shrink-0" />
                      <span className="font-mono text-[11px] text-cream/60 uppercase">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architect task plan */}
            {taskPlan && taskPlan.length > 0 && (
              <div className="liquid-glass rounded-[28px] p-6">
                <p className="font-mono text-[11px] uppercase text-cream/40 tracking-widest mb-3">🏗️ Architect Task Plan</p>
                <div className="flex flex-col gap-1.5">
                  {taskPlan.map((step, i) => (
                    <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedTask(expandedTask === i ? null : i)}
                      >
                        <span className="font-mono text-[10px] text-neon flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-mono text-[11px] text-cream/70 flex-1 truncate">{step.filepath}</span>
                        <span className="font-mono text-[10px] text-cream/30">{expandedTask === i ? '▾' : '▸'}</span>
                      </button>
                      {expandedTask === i && (
                        <div className="px-4 pb-3 pt-1 font-mono text-[11px] text-cream/50 leading-relaxed border-t border-white/5">
                          {step.task_description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated files */}
            {generatedFiles.length > 0 && (
              <div className="liquid-glass rounded-[28px] p-6">
                <p className="font-mono text-[11px] uppercase text-cream/40 tracking-widest mb-3">
                  Generated Files
                  {projectDir && (
                    <span className="ml-2 text-neon/60 normal-case">📁 {projectDir}</span>
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  {generatedFiles.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neon flex-shrink-0">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="font-mono text-[12px] text-cream/70">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Terminal */}
          <div className="liquid-glass rounded-[28px] overflow-hidden flex flex-col" style={{ minHeight: '420px' }}>
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-neon/60" />
              <span className="ml-3 font-mono text-[11px] text-cream/30 uppercase tracking-widest">agent.log</span>
            </div>

            {/* Log body */}
            <div
              ref={termRef}
              className="flex-1 overflow-y-auto p-5 font-mono text-[12px] leading-relaxed space-y-0.5"
              style={{ maxHeight: '520px' }}
            >
              {logs.length === 0 ? (
                <span className="text-cream/20 uppercase tracking-widest">Initializing pipeline…</span>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className={`flex gap-3 ${LOG_COLOR[entry.agent] ?? 'text-cream/50'}`}>
                    <span className="text-cream/20 flex-shrink-0">{entry.ts}</span>
                    <span className="break-all">{entry.line}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Done badge and Operations Controls */}
        {status === 'done' && (
          <div className="mt-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 mr-4">
                <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_10px_rgba(111,255,0,0.6)]" />
                <span className="font-mono text-[13px] uppercase text-neon tracking-widest font-bold">
                  Project complete!
                </span>
              </div>
              
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="font-mono text-[12px] uppercase text-background bg-neon hover:bg-neon/90 disabled:bg-neon/50 px-6 py-2.5 rounded-full transition-all duration-300 font-bold flex items-center gap-2"
              >
                {isDownloading ? (
                  <span>Zipping...</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Download ZIP
                  </>
                )}
              </button>

              <button
                onClick={handleRunLocally}
                disabled={isRunningLocal}
                className="font-mono text-[12px] uppercase text-cream border border-cream/30 hover:border-neon hover:text-neon disabled:opacity-50 px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                {isRunningLocal ? (
                  <span>Launching...</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    {isSimulated ? "Preview App Live" : "Run App Locally"}
                  </>
                )}
              </button>
            </div>
            
            {/* Embedded Live Preview Panel */}
            {showPreview && previewUrl && (
              <div className="liquid-glass rounded-[28px] overflow-hidden border border-neon/20 shadow-[0_0_30px_rgba(111,255,0,0.05)] mt-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_rgba(111,255,0,0.5)]" />
                    <span className="font-mono text-[11px] text-neon uppercase tracking-widest">
                      Live App Preview — {plan?.name || "Project"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="font-mono text-[11px] text-cream/40 hover:text-red-400 uppercase tracking-widest transition-colors"
                  >
                    Close [x]
                  </button>
                </div>
                <div className="bg-white h-[500px] w-full relative">
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-full border-none" 
                    title="Live App Preview"
                  />
                </div>
              </div>
            )}
            
            {/* FastAPI Interactive API Explorer Mock */}
            {showPreview && showMockApiExplorer && (
              <div className="liquid-glass rounded-[28px] overflow-hidden border border-neon/20 shadow-[0_0_30px_rgba(111,255,0,0.05)] mt-4 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_rgba(111,255,0,0.5)]" />
                    <span className="font-mono text-[11px] text-neon uppercase tracking-widest font-bold">
                      API Explorer — {plan?.name || "Project"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="font-mono text-[11px] text-cream/40 hover:text-red-400 uppercase tracking-widest transition-colors"
                  >
                    Close [x]
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Endpoints & Request */}
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                    <h4 className="font-grotesk text-[14px] uppercase text-cream tracking-wide">Endpoints</h4>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleMockApiCall('GET_POSTS')}
                        className="flex items-center justify-between p-2.5 rounded bg-white/5 hover:bg-white/10 text-left transition-all"
                      >
                        <span className="font-mono text-[12px] text-green-400 font-bold">GET /posts</span>
                        <span className="font-mono text-[10px] text-cream/40 uppercase">List Posts</span>
                      </button>
                      
                      <button 
                        onClick={() => handleMockApiCall('CREATE_POST')}
                        className="flex items-center justify-between p-2.5 rounded bg-white/5 hover:bg-white/10 text-left transition-all"
                      >
                        <span className="font-mono text-[12px] text-blue-400 font-bold">POST /posts</span>
                        <span className="font-mono text-[10px] text-cream/40 uppercase">Create Post</span>
                      </button>
                      
                      <button 
                        onClick={() => handleMockApiCall('GET_POST_1')}
                        className="flex items-center justify-between p-2.5 rounded bg-white/5 hover:bg-white/10 text-left transition-all"
                      >
                        <span className="font-mono text-[12px] text-green-400 font-bold">GET /posts/1</span>
                        <span className="font-mono text-[10px] text-cream/40 uppercase">Get Details</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Right Column: Console Response */}
                  <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-grotesk text-[14px] uppercase text-cream/60 tracking-wide">Console Output</h4>
                      <span className="font-mono text-[10px] text-neon font-bold">200 OK</span>
                    </div>
                    <pre className="flex-1 overflow-auto font-mono text-[11px] text-green-400 p-3 bg-black/60 rounded border border-white/5 whitespace-pre-wrap">
                      {mockApiResponse}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function getTodoSimulatedHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colorful Todo App</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 90vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 360px;
        }
        h1 {
            color: #333;
            margin-top: 0;
            font-size: 24px;
            text-align: center;
        }
        form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        input {
            flex: 1;
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus {
            border-color: #007bff;
        }
        button {
            padding: 10px 15px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        button:hover {
            background: #0056b3;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
        }
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: #f8f9fa;
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 4px solid #28a745;
            transition: all 0.2s;
            font-size: 14px;
        }
        li.completed {
            border-left-color: #6c757d;
            text-decoration: line-through;
            opacity: 0.6;
        }
        .todo-actions {
            display: flex;
            gap: 5px;
        }
        .todo-actions button {
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 4px;
        }
        .btn-delete {
            background: #dc3545;
        }
        .btn-delete:hover {
            background: #bd2130;
        }
        .btn-complete {
            background: #28a745;
        }
        .btn-complete:hover {
            background: #218838;
        }
        .filters {
            display: flex;
            justify-content: center;
            gap: 8px;
        }
        .filters button {
            background: #e2e6ea;
            color: #333;
            padding: 5px 10px;
            font-size: 11px;
        }
        .filters button.active {
            background: #007bff;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Colorful Todo App</h1>
        <form id="todo-form">
            <input type="text" id="new-todo" placeholder="Add a new todo" required>
            <button type="submit">Add</button>
        </form>
        <ul id="todo-list"></ul>
        <div class="filters">
            <button class="active" id="filter-all">All</button>
            <button id="filter-active">Active</button>
            <button id="filter-completed">Completed</button>
        </div>
    </div>
    <script>
        const form = document.getElementById('todo-form');
        const input = document.getElementById('new-todo');
        const list = document.getElementById('todo-list');
        const filterButtons = document.querySelectorAll('.filters button');
        
        let todos = JSON.parse(localStorage.getItem('todos')) || [
            { text: "Design landing page", completed: true },
            { text: "Implement agent pipeline", completed: false },
            { text: "Wire frontend with WebSocket/SSE", completed: false }
        ];

        function save() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }

        function render(filter = 'all') {
            list.innerHTML = '';
            todos.forEach((todo, idx) => {
                if (filter === 'active' && todo.completed) return;
                if (filter === 'completed' && !todo.completed) return;

                const li = document.createElement('li');
                if (todo.completed) li.classList.add('completed');
                
                li.innerHTML = \`
                    <span>\${todo.text}</span>
                    <div class="todo-actions">
                        <button class="btn-complete" onclick="toggle(\${idx})">\${todo.completed ? 'Undo' : 'Done'}</button>
                        <button class="btn-delete" onclick="remove(\${idx})">Delete</button>
                    </div>
                \`;
                list.appendChild(li);
            });
        }

        window.toggle = function(idx) {
            todos[idx].completed = !todos[idx].completed;
            save();
            render(document.querySelector('.filters button.active').id.replace('filter-', ''));
        };

        window.remove = function(idx) {
            todos.splice(idx, 1);
            save();
            render(document.querySelector('.filters button.active').id.replace('filter-', ''));
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            todos.push({ text, completed: false });
            input.value = '';
            save();
            render(document.querySelector('.filters button.active').id.replace('filter-', ''));
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                render(btn.id.replace('filter-', ''));
            });
        });

        render();
    </script>
</body>
</html>`;
}

function getCalculatorSimulatedHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elegant Calculator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 90vh;
        }
        .calculator {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            width: 280px;
        }
        .display {
            width: 100%;
            height: 60px;
            background: rgba(0, 0, 0, 0.25);
            border: none;
            border-radius: 10px;
            margin-bottom: 15px;
            color: white;
            font-size: 26px;
            text-align: right;
            padding: 0 15px;
            box-sizing: border-box;
            outline: none;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        button {
            height: 50px;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
        button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
        }
        button.operator {
            background: #ff9f0a;
            color: white;
        }
        button.operator:hover {
            background: #ffb53b;
        }
        button.clear {
            background: #fe3c30;
            color: white;
        }
        button.clear:hover {
            background: #ff5e57;
        }
        button.equal {
            grid-column: span 2;
            background: #34c759;
            color: white;
        }
        button.equal:hover {
            background: #4cd964;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" class="display" id="display" readonly value="0">
        <div class="grid">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button onclick="append('/')" class="operator">/</button>
            <button onclick="append('*')" class="operator">*</button>
            <button onclick="append('-')" class="operator">-</button>
            
            <button onclick="append('7')">7</button>
            <button onclick="append('8')">8</button>
            <button onclick="append('9')">9</button>
            <button onclick="append('+')" class="operator">+</button>
            
            <button onclick="append('4')">4</button>
            <button onclick="append('5')">5</button>
            <button onclick="append('6')">6</button>
            <button onclick="clearLast()" class="operator">⌫</button>
            
            <button onclick="append('1')">1</button>
            <button onclick="append('2')">2</button>
            <button onclick="append('3')">3</button>
            
            <button class="equal" onclick="calculate()">=</button>
            <button onclick="append('0')">0</button>
            <button onclick="append('.')">.</button>
        </div>
    </div>
    <script>
        const display = document.getElementById('display');
        let currentInput = '0';

        function updateDisplay() {
            display.value = currentInput;
        }

        window.append = function(val) {
            if (currentInput === '0' && val !== '.') {
                currentInput = val;
            } else {
                currentInput += val;
            }
            updateDisplay();
        };

        window.clearDisplay = function() {
            currentInput = '0';
            updateDisplay();
        };

        window.clearLast = function() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        };

        window.calculate = function() {
            try {
                currentInput = String(eval(currentInput));
            } catch(e) {
                currentInput = 'Error';
            }
            updateDisplay();
        };
    </script>
</body>
</html>`;
}
