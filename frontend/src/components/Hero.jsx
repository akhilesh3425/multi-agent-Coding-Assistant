import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Hero.css";

const EXAMPLES = [
  {
    emoji: "📝",
    label: "To-Do App",
    prompt:
      "Create a colourful modern to-do list app in HTML, CSS and JavaScript",
  },
  {
    emoji: "🧮",
    label: "Calculator",
    prompt:
      "Build a simple calculator web application with HTML, CSS and JavaScript",
  },
  {
    emoji: "⚡",
    label: "FastAPI Blog",
    prompt: "Create a blog REST API in FastAPI with a SQLite database",
  },
  {
    emoji: "🌤",
    label: "Weather App",
    prompt:
      "Build a weather dashboard with charts using HTML, CSS, JS and Chart.js",
  },
];

export default function Hero({ prompt, setPrompt, onRun, isRunning }) {
  const sectionRef = useRef(null);
  const tagRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const boxRef = useRef(null);
  const statsRef = useRef(null);
  const deco1Ref = useRef(null);
  const deco2Ref = useRef(null);
  const deco3Ref = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  /* ── Entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(tagRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      })
        .from(
          titleRef.current.children,
          {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
          },
          "-=0.3",
        )
        .from(
          subtitleRef.current,
          { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" },
          "-=0.4",
        )
        .from(
          boxRef.current,
          { y: 40, opacity: 0, duration: 0.7, ease: "power2.out", scale: 0.97 },
          "-=0.4",
        )
        .from(
          statsRef.current.children,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
          },
          "-=0.3",
        )
        .from(
          ".hero-line",
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.12,
            transformOrigin: "left center",
          },
          "-=0.4",
        );

      gsap.fromTo(
        ".hero-grid",
        { opacity: 0, scale: 0.98 },
        { opacity: 0.18, scale: 1, duration: 1.4, ease: "power2.out" },
      );

      // Deco cards float in
      gsap.from([deco1Ref.current, deco2Ref.current, deco3Ref.current], {
        opacity: 0,
        scale: 0.7,
        y: 40,
        duration: 0.9,
        ease: "back.out(1.4)",
        stagger: 0.18,
        delay: 1.1,
      });

      // Continuous float loop
      gsap.to(deco1Ref.current, {
        y: -12,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(deco2Ref.current, {
        y: -16,
        duration: 3.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.6,
      });
      gsap.to(deco3Ref.current, {
        y: -10,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.2,
      });

      // Stats counter
      const statNums = statsRef.current.querySelectorAll(".stat-num");
      statNums.forEach((el) => {
        const target = el.dataset.target;
        if (target === "∞") {
          setTimeout(() => {
            el.textContent = "∞";
          }, 900);
          return;
        }
        gsap.to(
          { val: 0 },
          {
            val: parseInt(target),
            duration: 1.5,
            delay: 1,
            ease: "power2.out",
            onUpdate() {
              el.textContent = Math.round(this.targets()[0].val);
            },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    particlesRef.current = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Prompt box glow on focus ── */
  const handleFocus = () => {
    gsap.to(boxRef.current, {
      boxShadow:
        "0 0 0 2px rgba(124,58,237,0.7), 0 0 40px rgba(124,58,237,0.25)",
      duration: 0.3,
    });
  };
  const handleBlur = () => {
    gsap.to(boxRef.current, {
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      duration: 0.3,
    });
  };

  const handleChip = (p) => {
    setPrompt(p);
    gsap.from(boxRef.current, {
      scale: 0.98,
      duration: 0.3,
      ease: "back.out(2)",
    });
  };

  const handleRun = () => {
    if (!prompt.trim() || isRunning) return;
    gsap.to(boxRef.current, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
    onRun(prompt);
    const el = document.getElementById("workspace");
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
  };

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <canvas className="hero-canvas" ref={canvasRef} />

      <div className="hero-grid" />
      <div className="hero-lines">
        <span className="hero-line line-1" />
        <span className="hero-line line-2" />
        <span className="hero-line line-3" />
      </div>

      {/* Gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="hero-content">
        <div className="hero-tag" ref={tagRef}>
          <span className="tag-star">✦</span>
          Quantum AI Orchestration
        </div>

        <h1 className="hero-title" ref={titleRef}>
          <span className="title-line">Design tomorrow.</span>
          <span className="title-line gradient-text">
            Launch it with a single prompt.
          </span>
        </h1>

        <p className="hero-subtitle" ref={subtitleRef}>
          Coder Buddy synchronizes autonomous <strong>Planner</strong>,{" "}
          <strong>Architect</strong>, and
          <strong>Coder</strong> agents into a sleek pipeline that generates
          production-ready systems from your idea in one command.
        </p>

        {/* Prompt box */}
        <div className="prompt-box" ref={boxRef}>
          <div className="prompt-header">
            <span className="prompt-label">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Your Project Prompt
            </span>
            {prompt && (
              <button
                className="clear-btn"
                onClick={() => setPrompt("")}
                title="Clear"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <textarea
            id="user-prompt"
            className="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
            }}
            placeholder="e.g. Create a to-do list app with HTML, CSS, and JavaScript…"
            rows={3}
          />

          <div className="prompt-footer">
            <div className="chips">
              <span className="chips-label">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  className="chip"
                  onClick={() => handleChip(ex.prompt)}
                >
                  {ex.emoji} {ex.label}
                </button>
              ))}
            </div>
            <button
              className={`run-btn ${isRunning ? "running" : ""}`}
              id="run-btn"
              onClick={handleRun}
              disabled={!prompt.trim() || isRunning}
            >
              {isRunning ? (
                <>
                  <span className="spinner" />
                  Running…
                </>
              ) : (
                <>
                  Generate Project
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row" ref={statsRef}>
          <div className="stat-item">
            <span className="stat-num" data-target="3">
              0
            </span>
            <span className="stat-label">AI Agents</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" data-target="100">
              0
            </span>
            <span className="stat-label">% Automated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num" data-target="∞">
              0
            </span>
            <span className="stat-label">Possibilities</span>
          </div>
        </div>
      </div>

      {/* Deco cards */}
      <div className="hero-deco">
        <div className="deco-card deco-1" ref={deco1Ref}>
          <span className="deco-emoji">🧠</span>
          <div>
            <div className="deco-title">Planner Agent</div>
            <div className="deco-sub">Analyzing requirements…</div>
          </div>
        </div>
        <div className="deco-card deco-2" ref={deco2Ref}>
          <span className="deco-emoji">🏗️</span>
          <div>
            <div className="deco-title">Architect Agent</div>
            <div className="deco-sub">Breaking down tasks…</div>
          </div>
        </div>
        <div className="deco-card deco-3" ref={deco3Ref}>
          <span className="deco-emoji">💻</span>
          <div>
            <div className="deco-title">Coder Agent</div>
            <div className="deco-sub">Writing code…</div>
          </div>
        </div>
      </div>
    </section>
  );
}
