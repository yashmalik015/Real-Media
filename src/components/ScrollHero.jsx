import { useState, useEffect, useRef } from "react";
import { LOGO_URL, COMPANY_NAME } from "../data/siteData.js";

const VIDEO1_COUNT = 40;
const VIDEO2_COUNT = 40;
const CONCURRENT_LOADS = 6;
const MIN_FRAMES_TO_START = 6;
const BASE = import.meta.env.BASE_URL;

const frameSrc = (video, i) =>
  `${BASE}frames/${video}/frame_${String(i).padStart(4, "0")}.jpg`;

const SERVICE_BOXES = [
  {
    icon: "🎬",
    title: "Creative Production",
    desc: "Cinematic shoots, premium editing, VFX, and social media content.",
    threshold: 0.52,
  },
  {
    icon: "💻",
    title: "Development",
    desc: "Websites, apps, software, and scalable digital products.",
    threshold: 0.55,
  },
  {
    icon: "📈",
    title: "Marketing & Branding",
    desc: "Ads, branding strategy, and online growth systems.",
    threshold: 0.58,
  },
];

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      resolve({ img: ok ? img : null, src });
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) finish(true);
  });
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function segmentProgress(progress, start, span = 0.1) {
  return clamp01((progress - start) / span);
}

function setPopEl(el, p) {
  if (!el) return;
  const y = (1 - p) * 56;
  const scale = 0.86 + p * 0.14;
  const rotX = (1 - p) * 18;
  el.style.opacity = String(p);
  el.style.transform = `translateY(${y}px) scale(${scale}) rotateX(${rotX}deg)`;
}

export function ScrollHero({ onStartProject, onExploreSkills, onBecomeFreelancer }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollHintRef = useRef(null);
  const heroCardRef = useRef(null);
  const boxRefs = useRef([]);
  const video1Ref = useRef([]);
  const video2Ref = useRef([]);
  const tickingRef = useRef(false);
  const currentFrameRef = useRef(-1);
  const currentVideoRef = useRef(1);
  const readyRef = useRef(false);
  const videoDoneRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoDone, setVideoDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const v1 = new Array(VIDEO1_COUNT).fill(null);
    const v2 = new Array(VIDEO2_COUNT).fill(null);
    video1Ref.current = v1;
    video2Ref.current = v2;
    const total = VIDEO1_COUNT + VIDEO2_COUNT;
    let resolved = 0;

    const bump = () => {
      if (cancelled) return;
      resolved++;
      setLoadProgress(resolved / total);
      const loaded = v1.filter(Boolean).length + v2.filter(Boolean).length;
      if (!readyRef.current && loaded >= MIN_FRAMES_TO_START) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const loadBatch = async (items) => {
      for (let i = 0; i < items.length; i += CONCURRENT_LOADS) {
        const slice = items.slice(i, i + CONCURRENT_LOADS);
        await Promise.all(
          slice.map(({ arr, idx, video }) =>
            loadImage(frameSrc(video, idx + 1)).then(({ img }) => {
              if (!cancelled && img) arr[idx] = img;
              bump();
            })
          )
        );
        if (cancelled) return;
      }
    };

    const items = [
      ...v1.map((_, i) => ({ arr: v1, idx: i, video: "video1" })),
      ...v2.map((_, i) => ({ arr: v2, idx: i, video: "video2" })),
    ];
    loadBatch(items);

    const fallback = setTimeout(() => {
      if (!readyRef.current && (v1.some(Boolean) || v2.some(Boolean))) {
        readyRef.current = true;
        setReady(true);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const getFrame = (frames, index) => {
      if (frames[index]) return frames[index];
      for (let d = 1; d < frames.length; d++) {
        if (frames[index - d]) return frames[index - d];
        if (frames[index + d]) return frames[index + d];
      }
      return null;
    };

    const drawFrame = (img, videoNum = 1) => {
      if (!img) return;

      const cw = window.innerWidth;
      const ch = window.innerHeight - 81;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      let drawW, drawH;
      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
      }

      if (window.innerWidth <= 768) {
        drawW *= 1.3;
        drawH *= 1.3;
      }

      let drawX = (cw - drawW) / 2;
      let drawY = (ch - drawH) / 2;

      if (videoNum === 2 && window.innerWidth > 768) {
        drawX = (cw * 0.75) - (drawW / 2);
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    const updateUI = (progress) => {
      const cardP = segmentProgress(progress, 0.5, 0.08);
      if (heroCardRef.current) {
        const x = (1 - cardP) * 48;
        const scale = 0.9 + cardP * 0.1;
        const rotY = (1 - cardP) * -12;
        heroCardRef.current.style.opacity = String(cardP);
        heroCardRef.current.style.transform = `translateX(${x}px) scale(${scale}) rotateY(${rotY}deg)`;
      }

      boxRefs.current.forEach((el, i) => {
        setPopEl(el, segmentProgress(progress, SERVICE_BOXES[i].threshold, 0.06));
      });
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = (window.innerHeight - 81) * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight - 81 + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (currentFrameRef.current >= 0) {
        const frames =
          currentVideoRef.current === 1 ? video1Ref.current : video2Ref.current;
        drawFrame(getFrame(frames, currentFrameRef.current), currentVideoRef.current);
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) {
          tickingRef.current = false;
          return;
        }

        const viewportH = window.innerHeight - 81;
        const rect = section.getBoundingClientRect();
        const scrollableHeight = section.offsetHeight - viewportH;
        const progress = scrollableHeight > 0
          ? Math.min(1, Math.max(0, (81 - rect.top) / scrollableHeight))
          : 0;

        const video = progress < 0.5 ? 1 : 2;
        const frameIndex = progress < 0.5
          ? Math.round((progress / 0.5) * (VIDEO1_COUNT - 1))
          : Math.round(((progress - 0.5) / 0.5) * (VIDEO2_COUNT - 1));

        if (progress >= 0.5) {
          updateUI(progress);
        }

        if (progress < 0.5) {
          if (heroCardRef.current) {
            heroCardRef.current.style.opacity = "0";
            heroCardRef.current.style.transform = "translateX(48px) scale(0.9) rotateY(-12deg)";
          }
          boxRefs.current.forEach((el) => setPopEl(el, 0));
        }

        const frames = video === 1 ? video1Ref.current : video2Ref.current;
        const changed = frameIndex !== currentFrameRef.current || video !== currentVideoRef.current;
        if (changed) {
          currentFrameRef.current = frameIndex;
          currentVideoRef.current = video;
          drawFrame(getFrame(frames, frameIndex), video);
        }

        const done = progress >= 1;
        if (done !== videoDoneRef.current) {
          videoDoneRef.current = done;
          setVideoDone(done);
        }

        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = done ? "0" : "1";
          const label = scrollHintRef.current.querySelector("span");
          if (label) {
            if (done) label.textContent = "Keep scrolling";
            else if (progress < 0.5) label.textContent = "Scroll to play";
            else label.textContent = "Keep scrolling";
          }
        }

        tickingRef.current = false;
      });
    };

    resizeCanvas();
    drawFrame(getFrame(video1Ref.current, 0), 1);
    updateUI(0);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready]);

  const showLoader = !ready || loadProgress < 1;

  return (
    <>
      {showLoader && (
        <div className={`scroll-hero-loader ${ready ? "scroll-hero-loader--fade" : ""}`}>
          <div className="scroll-hero-loader-inner">
            <img src={LOGO_URL} alt={COMPANY_NAME} className="scroll-hero-loader-logo" />
            <div className="scroll-hero-loader-bar">
              <div className="scroll-hero-loader-fill" style={{ width: `${loadProgress * 100}%` }} />
            </div>
            <p className="scroll-hero-loader-text">
              {ready ? "Almost ready…" : "Loading experience…"} {Math.round(loadProgress * 100)}%
            </p>
          </div>
        </div>
      )}

      <section ref={sectionRef} className="scroll-hero-section">
        <div className={`scroll-hero-sticky ${videoDone ? "scroll-hero-sticky--done" : ""}`}>
          <canvas ref={canvasRef} className="scroll-hero-canvas" />
          <div className="scroll-hero-vignette" />

          <div className="hero-inner scroll-hero-overlay">
            <div className="scroll-hero-left">
              <span className="hero-label">LEARN • BUILD • EARN</span>
              <h1 className="hero-title">
                LEARN.<br />
                <span className="red-w" data-text="BUILD">
                  BUILD
                </span>
                <br />
                EARN.
              </h1>
              <p className="hero-copy">
                Master high-income digital skills for free, build real projects, become verified, and start earning from real clients — all within {COMPANY_NAME}.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={onExploreSkills}>
                  Explore Skills
                </button>
                <button className="btn-ghost" onClick={onBecomeFreelancer}>
                  Become a Freelancer
                </button>
                <button className="btn-ghost" onClick={onStartProject}>
                  Start Your Project
                </button>
              </div>
              <div className="trust-strip">
                {["50+ Projects Delivered", "4.9★ Client Rating", "Dedicated Handler", "Revision Guarantee"].map(
                  (t) => (
                    <div className="trust-item" key={t}>
                      <div className="trust-icon">✓</div>
                      <span>{t}</span>
                    </div>
                  )
                )}
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-num">50+</div>
                  <div className="hero-stat-label">Projects</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-num">₹2Cr+</div>
                  <div className="hero-stat-label">Revenue Generated</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-num">98%</div>
                  <div className="hero-stat-label">Client Retention</div>
                </div>
              </div>
            </div>

            <div ref={heroCardRef} className="hero-card scroll-hero-card-3d">
              <div className="hero-card-head">
                <img src={LOGO_URL} alt={COMPANY_NAME} />
                <div>
                  <div className="bn" style={{ fontSize: "1.6rem", letterSpacing: ".16em" }}>
                    {COMPANY_NAME.toUpperCase()}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: ".84rem", marginTop: 4 }}>
                    Building Brands. Growing Global.
                  </div>
                </div>
              </div>
              {SERVICE_BOXES.map((box, i) => (
                <div
                  className="fc scroll-hero-fc"
                  key={box.title}
                  ref={(el) => {
                    boxRefs.current[i] = el;
                  }}
                >
                  <h4>
                    {box.icon} {box.title}
                  </h4>
                  <p>{box.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div ref={scrollHintRef} className="scroll-hero-hint">
            <span>Scroll to play</span>
            <div className="scroll-hero-hint-line" />
          </div>
        </div>
      </section>
    </>
  );
}
