import { useState, useRef, useCallback } from "react";

export type AgentId = "planner" | "architect" | "coder";
export type AgentStatus = "idle" | "running" | "done";
export type RunStatus = "idle" | "running" | "done" | "error";

export interface LogEntry {
  ts: string;
  line: string;
  agent: string;
}

export interface PlanData {
  name: string;
  description: string;
  techstack: string;
  features: string[];
  files: string[];
}

export interface TaskStep {
  filepath: string;
  task_description: string;
}

export interface AgentRunState {
  status: RunStatus;
  agentStates: Record<AgentId, AgentStatus>;
  logs: LogEntry[];
  plan: PlanData | null;
  taskPlan: TaskStep[] | null;
  projectDir: string | null;
  generatedFiles: string[];
  progress: number;
  isSimulated: boolean;
  prompt: string;
  review: string | null;
  run: (prompt: string) => void;
  clearAll: () => void;
}

const ts = () => new Date().toLocaleTimeString();

export function useAgentRun(): AgentRunState {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentStatus>>({
    planner: "idle",
    architect: "idle",
    coder: "idle",
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [taskPlan, setTaskPlan] = useState<TaskStep[] | null>(null);
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [review, setReview] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((line: string, agent: string) => {
    setLogs((prev) => [...prev, { ts: ts(), line, agent }]);
  }, []);

  const clearAll = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setAgentStates({ planner: "idle", architect: "idle", coder: "idle" });
    setLogs([]);
    setPlan(null);
    setTaskPlan(null);
    setProjectDir(null);
    setGeneratedFiles([]);
    setProgress(0);
    setIsSimulated(false);
    setPrompt("");
    setReview(null);
  }, []);

  const run = useCallback(
    async (prompt: string) => {
      clearAll();
      setPrompt(prompt);
      setStatus("running");

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let localDone: Record<AgentId, boolean> = {
        planner: false,
        architect: false,
        coder: false,
      };

      const calcProgress = (done: Record<AgentId, boolean>) => {
        const n = Object.values(done).filter(Boolean).length;
        return Math.round((n / 3) * 95);
      };

      const updateAgent = (agent: AgentId, state: AgentStatus) => {
        setAgentStates((prev) => ({ ...prev, [agent]: state }));
        if (state === "done") {
          localDone = { ...localDone, [agent]: true };
          setProgress(calcProgress(localDone));
        }
      };

      const sleep = (ms: number) =>
        new Promise<void>((resolve, reject) => {
          if (ctrl.signal.aborted)
            return reject(new DOMException("Aborted", "AbortError"));
          const timer = setTimeout(() => {
            ctrl.signal.removeEventListener("abort", onAbort);
            resolve();
          }, ms);
          const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          };
          ctrl.signal.addEventListener("abort", onAbort);
        });

      const runSimulation = async () => {
        setIsSimulated(true);
        try {
          // Parse prompt keywords to customize simulated output
          let appName = "Colorful Modern Todo App";
          let appDesc =
            "A beautiful, modern todo list with custom categories, local storage persistence, and transition effects.";
          let appTech = "HTML, CSS, JavaScript";
          let appFeatures = [
            "Add new todo items",
            "Delete todo items",
            "Mark completed",
            "Filter by status",
            "Store in local storage",
          ];
          let appFiles = ["index.html", "styles.css", "script.js"];
          let appTasks: TaskStep[] = [
            {
              filepath: "index.html",
              task_description:
                "Implement the basic structure of the todo app in HTML. Define a header with the title 'Colorful Todo App', a form to add new todo items that includes an input field and a submit button, an unordered list to display todos, and buttons for filtering (all, completed, active).",
            },
            {
              filepath: "styles.css",
              task_description:
                "Create styles for the todo app to ensure a colorful and modern design. Define styles for the body, header, form, and todos. Include a button style for 'Add Todo' to make it visually appealing. Also, style the todos differently based on completion status (completed todos should have a strikethrough effect).",
            },
            {
              filepath: "script.js",
              task_description:
                "Add JavaScript functionality to the todo app. Implement event listeners for the form submission. Define a function 'addTodo' that retrieves input value from 'new-todo', creates a new list item, and appends it to 'todo-list'. Incorporate local storage functionality to persist todos.",
            },
            {
              filepath: "script.js",
              task_description:
                "Extend JavaScript file to include filtering functionality for todos. Define a function 'filterTodos' that adjusts the display of todos based on the selected filter from the buttons. Attach this function to the filter buttons in index.html.",
            },
          ];

          const lower = prompt.toLowerCase();
          if (lower.includes("calc") || lower.includes("calculator")) {
            appName = "Elegant Calculator Web App";
            appDesc =
              "A modern calculator web app with dark mode, scientific functions, and animation effects.";
            appFeatures = [
              "Standard arithmetic operations",
              "History log of calculations",
              "Dark/Light theme toggle",
              "Keyboard shortcuts support",
            ];
            appFiles = ["index.html", "styles.css", "script.js"];
            appTasks = [
              {
                filepath: "index.html",
                task_description:
                  "Create the calculator layout in HTML. Include a screen/display division, buttons for digits, operations, clear, and equal. Define specific IDs for the key buttons to hook JavaScript listeners.",
              },
              {
                filepath: "styles.css",
                task_description:
                  "Style the calculator container and key buttons. Use a dark background, smooth gradients, and glassmorphism. Add micro-animations on button hover/click.",
              },
              {
                filepath: "script.js",
                task_description:
                  "Write calculator logic. Set up event listeners for keys. Track current input, operator, and calculation history. Update the display dynamically. Implement key bindings.",
              },
            ];
          } else if (lower.includes("blog") || lower.includes("api")) {
            appName = "FastAPI Blog API";
            appDesc =
              "A lightweight FastAPI backend with SQLModel, user authentication, and SQLite database.";
            appTech = "Python, FastAPI, SQLite";
            appFeatures = [
              "User registration and JWT authentication",
              "CRUD endpoints for blog posts",
              "SQLite persistence with SQLModel",
              "Swagger documentation integration",
            ];
            appFiles = ["main.py", "models.py", "database.py", "auth.py"];
            appTasks = [
              {
                filepath: "database.py",
                task_description:
                  "Set up the SQLite database connection using SQLModel. Define the engine and session helper functions for dependency injection.",
              },
              {
                filepath: "models.py",
                task_description:
                  "Create models for User and BlogPost. Define table attributes, relationship back-references, and Pydantic schemas for request/response serialization.",
              },
              {
                filepath: "auth.py",
                task_description:
                  "Implement password hashing with bcrypt, JWT token generation, and user validation middleware for secure routes.",
              },
              {
                filepath: "main.py",
                task_description:
                  "Initialize the FastAPI application. Mount auth and post routers. Add endpoints for creating, reading, updating, and deleting blog posts.",
              },
            ];
          }

          addLog("> Starting Coder Buddy pipeline…", "system");
          addLog(`> Prompt: "${prompt}"`, "system");
          await sleep(600);

          // Planner start
          updateAgent("planner", "running");
          addLog("[PLANNER] Analyzing requirements…", "planner");
          await sleep(1500);
          addLog("[PLANNER] ✓ Plan generated successfully.", "planner");
          setPlan({
            name: appName,
            description: appDesc,
            techstack: appTech,
            features: appFeatures,
            files: appFiles,
          });
          updateAgent("planner", "done");
          await sleep(600);

          // Architect start
          updateAgent("architect", "running");
          addLog(
            "[ARCHITECT] Breaking down implementation tasks…",
            "architect",
          );
          await sleep(1800);
          setTaskPlan(appTasks);
          addLog(
            `[ARCHITECT] Created ${appTasks.length} tasks. Handing off to Coder…`,
            "architect",
          );
          updateAgent("architect", "done");
          await sleep(800);

          // Coder start
          updateAgent("coder", "running");
          const safeName = appName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .substring(0, 30);
          const projectFolderName = `${safeName}_simulated`;
          setProjectDir(projectFolderName);
          addLog(
            `[CODER] Output folder: generated_projects/${projectFolderName}`,
            "coder",
          );
          await sleep(600);

          for (let i = 0; i < appTasks.length; i++) {
            const task = appTasks[i];
            addLog(
              `[CODER] Task ${i + 1}/${appTasks.length}: ${task.filepath}`,
              "coder",
            );
            await sleep(1500);
            addLog(`[CODER] ✓ WROTE: ${task.filepath}`, "coder");
            setGeneratedFiles((prev) => {
              if (!prev.includes(task.filepath)) {
                return [...prev, task.filepath];
              }
              return prev;
            });
            await sleep(600);
          }
          updateAgent("coder", "done");
          await sleep(800);

          // Reviewer start
          addLog("[REVIEWER] Reviewing generated project…", "reviewer");
          await sleep(1500);
          const reviewContent = `## 1. Completeness
All ${appTasks.length} implementation steps addressed successfully.

## 2. Consistency
Naming conventions and file imports are fully consistent.

## 3. Potential Issues
No critical bugs found. Local storage and routes operate properly.

## Summary
The generated project meets all requirements and is production-ready.`;
          addLog("== REVIEW REPORT ==", "reviewer");
          addLog("### 1. Completeness", "reviewer");
          addLog(
            `All ${appTasks.length} implementation steps addressed successfully.`,
            "reviewer",
          );
          addLog("### 2. Consistency", "reviewer");
          addLog(
            "Naming conventions and file imports are fully consistent.",
            "reviewer",
          );
          addLog("### 3. Potential Issues", "reviewer");
          addLog(
            "No critical bugs found. Local storage and routes operate properly.",
            "reviewer",
          );
          addLog("[REVIEWER] ✓ Review complete.", "reviewer");
          setReview(reviewContent);
          await sleep(800);

          // Success final
          addLog("✓ Project generation complete!", "success");
          addLog(`  Output directory: generated_project/`, "success");
          setProgress(100);
          setStatus("done");
        } catch (simErr: any) {
          if (simErr?.name !== "AbortError") {
            console.error("[Simulation] Failed during run:", simErr);
          }
        }
      };

      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          addLog(`HTTP ${res.status}: ${await res.text()}`, "system");
          addLog(
            "Failed to connect to API server. Running simulated demo mode instead...",
            "system",
          );
          await runSimulation();
          return;
        }

        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = "";

        // ── SSE event dispatcher (defined before the loop so it's always in scope) ──
        function handle(event: string, data: any) {
          switch (event) {
            case "agent_start":
              if (["planner", "architect", "coder"].includes(data.agent))
                updateAgent(data.agent as AgentId, "running");
              break;

            case "agent_done":
              if (["planner", "architect", "coder"].includes(data.agent))
                updateAgent(data.agent as AgentId, "done");
              break;

            case "log":
              addLog(data.line, data.agent ?? "system");
              break;

            case "task_plan":
              setTaskPlan(data.steps); // [{filepath, task_description}, ...]
              break;

            case "project_dir":
              setProjectDir(data.path);
              break;

            case "plan":
              setPlan(data);
              break;

            case "file_written":
              setGeneratedFiles((prev) => [...prev, data.path]);
              break;

            case "review":
              setReview(data.content);
              break;

            case "done":
              setProgress(100);
              setStatus("done");
              setAgentStates({
                planner: "done",
                architect: "done",
                coder: "done",
              });
              break;

            case "error":
              addLog(`Error: ${data.message}`, "system");
              setStatus("error");
              break;
          }
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop()!;
          let evt = "message";
          for (const raw of lines) {
            if (raw.startsWith("event:")) {
              evt = raw.slice(6).trim();
            } else if (raw.startsWith("data:")) {
              try {
                const data = JSON.parse(raw.slice(5).trim());
                handle(evt, data);
              } catch (parseErr) {
                console.warn("[SSE] Failed to parse data line:", raw, parseErr);
              }
              evt = "message";
            }
          }
        }
      } catch (err: any) {
        if (ctrl.signal.aborted) return;
        addLog(
          "Could not connect to API server. Running simulated demo mode instead...",
          "system",
        );
        await runSimulation();
      }
    },
    [clearAll, addLog],
  );

  return {
    status,
    agentStates,
    logs,
    plan,
    taskPlan,
    projectDir,
    generatedFiles,
    progress,
    isSimulated,
    prompt,
    review,
    run,
    clearAll,
  };
}
