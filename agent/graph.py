import pathlib
import re
import warnings
from datetime import datetime

from dotenv import load_dotenv
from langchain_core.globals import set_verbose, set_debug
from langchain_groq.chat_models import ChatGroq
from langchain_openai import ChatOpenAI


# Suppress LangGraph checkpoint warning until the package defaults are updated.
try:
    from langchain import LangChainPendingDeprecationWarning
except ImportError:
    LangChainPendingDeprecationWarning = DeprecationWarning

warnings.filterwarnings(
    "ignore",
    category=LangChainPendingDeprecationWarning,
    message=r"The default value of `allowed_objects` will change in a future version.*",
)

from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent


from agent.prompts import *
from agent.states import *
from agent.tools import write_file, read_file, get_current_directory, list_files, set_project_root

_ = load_dotenv()

set_debug(True)
set_verbose(True)

# ── Per-agent models ──────────────────────────────────────────────────────────
planner_llm   = ChatOpenAI(model="gpt-4o-mini")
architect_llm = ChatOpenAI(model="gpt-4o-mini")  # reliable structured output
coder_llm     = ChatOpenAI(model="gpt-4o-mini")
reviewer_llm  = ChatOpenAI(model="gpt-4o-mini")
# ──────────────────────────────────────────────────────────────────────────────


def _emit(state: dict, event: str, data: dict) -> None:
    """Push a structured SSE event into the optional event queue in state."""
    q = state.get("_eq")
    if q is not None:
        q.put({"event": event, "data": data})


def planner_agent(state: dict) -> dict:
    """Converts user prompt into a structured Plan."""
    _emit(state, "agent_start", {"agent": "planner"})
    _emit(state, "log", {"agent": "planner", "line": "[PLANNER] Analyzing requirements…"})
    user_prompt = state["user_prompt"]
    resp = planner_llm.with_structured_output(Plan).invoke(
        planner_prompt(user_prompt)
    )
    if resp is None:
        raise ValueError("Planner did not return a valid response.")
    _emit(state, "log", {"agent": "planner", "line": "[PLANNER] ✓ Plan generated successfully."})
    _emit(state, "plan", {
        "name": resp.name,
        "description": resp.description,
        "techstack": resp.techstack,
        "features": resp.features,
        "files": [f.path for f in resp.files],
    })
    _emit(state, "agent_done", {"agent": "planner"})
    return {"plan": resp}


def architect_agent(state: dict) -> dict:
    """Creates TaskPlan from Plan."""
    _emit(state, "agent_start", {"agent": "architect"})
    _emit(state, "log", {"agent": "architect", "line": "[ARCHITECT] Breaking down implementation tasks…"})
    plan: Plan = state["plan"]
    resp = architect_llm.with_structured_output(TaskPlan).invoke(
        architect_prompt(plan=plan.model_dump_json())
    )
    if resp is None:
        raise ValueError("Architect did not return a valid response.")

    resp.plan = plan
    print(resp.model_dump_json())
    n = len(resp.implementation_steps)
    _emit(state, "log", {"agent": "architect", "line": f"[ARCHITECT] Created {n} tasks. Handing off to Coder…"})
    # Emit structured task plan so the frontend can render it
    _emit(state, "task_plan", {
        "steps": [
            {"filepath": s.filepath, "task_description": s.task_description}
            for s in resp.implementation_steps
        ]
    })
    _emit(state, "agent_done", {"agent": "architect"})
    return {"task_plan": resp}


def coder_agent(state: dict) -> dict:
    """LangGraph tool-using coder agent."""
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        _emit(state, "agent_start", {"agent": "coder"})
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

        # ── Create a unique output folder for this project ──────────────────
        plan: Plan = state["task_plan"].plan
        safe_name = re.sub(r"[^\w\-]", "_", plan.name)[:40].strip("_") or "project"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_dir = pathlib.Path.cwd() / "generated_projects" / f"{safe_name}_{timestamp}"
        set_project_root(project_dir)
        _emit(state, "project_dir", {"path": str(project_dir.name)})
        _emit(state, "log", {"agent": "coder", "line": f"[CODER] Output folder: generated_projects/{project_dir.name}"})

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        _emit(state, "agent_done", {"agent": "coder"})
        return {"coder_state": coder_state, "status": "REVIEW"}

    current_task = steps[coder_state.current_step_idx]
    total = len(steps)
    idx = coder_state.current_step_idx
    _emit(state, "log", {"agent": "coder", "line": f"[CODER] Task {idx + 1}/{total}: {current_task.filepath}"})

    existing_content = read_file.run(current_task.filepath)
    # Truncate existing content to avoid exceeding model token limits
    MAX_EXISTING_CHARS = 1500
    if len(existing_content) > MAX_EXISTING_CHARS:
        existing_content = existing_content[:MAX_EXISTING_CHARS] + "\n... (truncated, use read_file to see full content)"

    system_prompt = coder_system_prompt()
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "Call write_file(path, content) with the COMPLETE file content to save."
    )

    coder_tools = [read_file, write_file, list_files, get_current_directory]
    react_agent = create_react_agent(coder_llm, coder_tools)

    react_agent.invoke({"messages": [{"role": "system", "content": system_prompt},
                                     {"role": "user", "content": user_prompt}]})

    _emit(state, "log", {"agent": "coder", "line": f"[CODER] ✓ WROTE: {current_task.filepath}"})
    _emit(state, "file_written", {"path": current_task.filepath})
    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


def reviewer_agent(state: dict) -> dict:
    """Reviews the completed project and provides a summary report."""
    _emit(state, "agent_start", {"agent": "reviewer"})
    _emit(state, "log", {"agent": "reviewer", "line": "[REVIEWER] Reviewing generated project…"})
    task_plan: TaskPlan = state["coder_state"].task_plan
    resp = reviewer_llm.invoke(
        reviewer_prompt(task_plan=task_plan.model_dump_json())
    )
    review_content = resp.content if hasattr(resp, "content") else str(resp)
    print("\n== REVIEW REPORT ==\n", review_content)
    _emit(state, "log", {"agent": "reviewer", "line": "[REVIEWER] ✓ Review complete."})
    _emit(state, "agent_done", {"agent": "reviewer"})
    return {"review": review_content, "status": "DONE"}


# ── Graph definition ──────────────────────────────────────────────────────────
graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)
graph.add_node("reviewer", reviewer_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")
graph.add_conditional_edges(
    "coder",
    lambda s: "reviewer" if s.get("status") == "REVIEW" else "coder",
    {"reviewer": "reviewer", "coder": "coder"}
)
graph.add_edge("reviewer", END)

graph.set_entry_point("planner")
agent = graph.compile()

if __name__ == "__main__":
    result = agent.invoke({"user_prompt": "Build a colourful modern todo app in html css and js"},
                          {"recursion_limit": 100})
    print("Final State:", result)
