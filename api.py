"""
api.py — FastAPI server that streams LangGraph agent events via SSE.

Start with:
    uvicorn api:app --reload --port 8000
"""

import asyncio
import json
import queue
import threading
import os
import shutil
import tempfile
import pathlib
import socket
import webbrowser
import http.server
import socketserver
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

load_dotenv()


# ── App setup ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import here so the model probe (architect fallback) runs at startup
    from agent.graph import agent as _agent  # noqa: F401
    yield

app = FastAPI(title="Coder Buddy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schema ────────────────────────────────────────────────────────────

class RunRequest(BaseModel):
    prompt: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _run_agent_thread(prompt: str, eq: "queue.Queue[dict | None]") -> None:
    """Run the LangGraph agent in a background thread, emitting SSE events."""
    from agent.graph import agent

    try:
        eq.put({"event": "log", "data": {"agent": "system", "line": f'> Starting Coder Buddy pipeline…'}})
        eq.put({"event": "log", "data": {"agent": "system", "line": f'> Prompt: "{prompt}"'}})

        agent.invoke(
            {"user_prompt": prompt, "_eq": eq},
            {"recursion_limit": 100},
        )

        from agent.tools import get_project_root
        project_dir = get_project_root()
        try:
            rel_path = project_dir.relative_to(pathlib.Path.cwd())
        except ValueError:
            rel_path = project_dir

        eq.put({"event": "log", "data": {"agent": "success", "line": "✓ Project generation complete!"}})
        eq.put({"event": "log", "data": {"agent": "success", "line": f"  Output directory: {rel_path.as_posix()}/"}})
        eq.put({"event": "done", "data": {"status": "complete"}})

    except Exception as exc:
        eq.put({"event": "error", "data": {"message": str(exc)}})
    finally:
        eq.put(None)  # sentinel — tells the generator to stop


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/run")
async def run(req: RunRequest):
    """Stream agent events as Server-Sent Events."""
    eq: queue.Queue = queue.Queue()

    thread = threading.Thread(
        target=_run_agent_thread,
        args=(req.prompt, eq),
        daemon=True,
    )
    thread.start()

    async def event_generator():
        loop = asyncio.get_event_loop()

        while True:
            # Poll the queue without blocking the event loop
            try:
                item = await loop.run_in_executor(None, lambda: eq.get(timeout=0.1))
            except queue.Empty:
                await asyncio.sleep(0)
                continue

            if item is None:
                break

            yield {
                "event": item["event"],
                "data": json.dumps(item["data"]),
            }

    return EventSourceResponse(event_generator())


# ── Active Servers Tracker ───────────────────────────────────────────────────
_active_project_servers = {}

def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def _start_http_server(project_path: pathlib.Path, port: int):
    class SafeHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(project_path), **kwargs)
        def log_message(self, format, *args):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), SafeHandler) as httpd:
        httpd.serve_forever()


# ── Project Operations Routes ────────────────────────────────────────────────
@app.get("/api/download-zip/{project_dir}")
async def download_zip(project_dir: str):
    base_dir = pathlib.Path.cwd() / "generated_projects"
    target_dir = (base_dir / project_dir).resolve()
    
    if base_dir.resolve() not in target_dir.parents and base_dir.resolve() != target_dir:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
        
    if not target_dir.exists() or not target_dir.is_dir():
        return JSONResponse(status_code=404, content={"error": "Project not found"})

    temp_dir = tempfile.gettempdir()
    zip_name = f"{project_dir}"
    zip_path = os.path.join(temp_dir, zip_name)
    
    # Create the zip archive
    shutil.make_archive(zip_path, 'zip', str(target_dir))
    
    return FileResponse(
        path=f"{zip_path}.zip",
        filename=f"{project_dir}.zip",
        media_type="application/zip"
    )

@app.post("/api/run-local/{project_dir}")
async def run_local(project_dir: str):
    base_dir = pathlib.Path.cwd() / "generated_projects"
    target_dir = (base_dir / project_dir).resolve()
    
    if base_dir.resolve() not in target_dir.parents and base_dir.resolve() != target_dir:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
        
    if not target_dir.exists() or not target_dir.is_dir():
        return JSONResponse(status_code=404, content={"error": "Project not found"})

    if project_dir in _active_project_servers:
        port = _active_project_servers[project_dir]
        url = f"http://localhost:{port}"
        return {"status": "already_running", "port": port, "url": url}

    port = get_free_port()
    t = threading.Thread(
        target=_start_http_server,
        args=(target_dir, port),
        daemon=True
    )
    t.start()
    
    _active_project_servers[project_dir] = port
    url = f"http://localhost:{port}"
    
    await asyncio.sleep(0.5)
    
    return {"status": "started", "port": port, "url": url}

@app.get("/api/project-files/{project_dir}")
async def get_project_files(project_dir: str):
    base_dir = pathlib.Path.cwd() / "generated_projects"
    target_dir = (base_dir / project_dir).resolve()
    
    if base_dir.resolve() not in target_dir.parents and base_dir.resolve() != target_dir:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
        
    if not target_dir.exists() or not target_dir.is_dir():
        return JSONResponse(status_code=404, content={"error": "Project not found"})

    files_content = {}
    for p in target_dir.glob("**/*"):
        if p.is_file():
            rel_path = str(p.relative_to(target_dir)).replace("\\", "/")
            try:
                with open(p, "r", encoding="utf-8") as f:
                    files_content[rel_path] = f.read()
            except Exception:
                pass
                
    return {"files": files_content}


@app.get("/api/project-view/{project_dir}")
async def project_view(project_dir: str):
    """Serve project as embedded HTML page for iframe preview"""
    base_dir = pathlib.Path.cwd() / "generated_projects"
    target_dir = (base_dir / project_dir).resolve()
    
    if base_dir.resolve() not in target_dir.parents and base_dir.resolve() != target_dir:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
        
    if not target_dir.exists() or not target_dir.is_dir():
        return JSONResponse(status_code=404, content={"error": "Project not found"})

    # Find and read index.html
    index_path = target_dir / "index.html"
    if not index_path.exists():
        # Try to find any HTML file
        html_files = list(target_dir.glob("*.html"))
        if not html_files:
            return JSONResponse(status_code=404, content={"error": "No HTML file found"})
        index_path = html_files[0]

    try:
        with open(index_path, "r", encoding="utf-8") as f:
            html_content = f.read()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    # Inline CSS files
    css_content = ""
    for css_path in target_dir.glob("**/*.css"):
        try:
            with open(css_path, "r", encoding="utf-8") as f:
                css_content += f"\n/* From {css_path.name} */\n{f.read()}\n"
        except Exception:
            pass

    # Inline JS files
    js_content = ""
    for js_path in target_dir.glob("**/*.js"):
        try:
            with open(js_path, "r", encoding="utf-8") as f:
                js_content += f"\n// From {js_path.name}\n{f.read()}\n"
        except Exception:
            pass

    # Inject inlined CSS and JS
    if css_content:
        html_content = html_content.replace("</head>", f"<style>\n{css_content}\n</style></head>")
    if js_content:
        html_content = html_content.replace("</body>", f"<script>\n{js_content}\n</script></body>")

    return HTMLResponse(content=html_content)


@app.get("/api/project-assets/{project_dir}/{file_path:path}")
async def project_asset(project_dir: str, file_path: str):
    """Serve individual files from the project"""
    base_dir = pathlib.Path.cwd() / "generated_projects"
    target_dir = (base_dir / project_dir).resolve()
    
    if base_dir.resolve() not in target_dir.parents and base_dir.resolve() != target_dir:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
        
    if not target_dir.exists() or not target_dir.is_dir():
        return JSONResponse(status_code=404, content={"error": "Project not found"})

    # Safely resolve the file path
    file_to_serve = (target_dir / file_path).resolve()
    if target_dir.resolve() not in file_to_serve.parents and target_dir.resolve() != file_to_serve:
        return JSONResponse(status_code=400, content={"error": "Access denied"})
    
    if not file_to_serve.exists() or not file_to_serve.is_file():
        return JSONResponse(status_code=404, content={"error": "File not found"})

    return FileResponse(path=file_to_serve)
