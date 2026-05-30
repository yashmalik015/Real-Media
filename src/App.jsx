import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { api, getToken, setToken, mediaUrl } from "./api.js";
import logoUrl from "./assets/Real Media logo.png";
// ─── DESIGN TOKENS & GLOBALS ─────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');
:root {
  --red: #e53935;
  --red-dark: #9f1111;
  --red-glow: rgba(229,57,53,0.22);
  --ink: #060606;
  --surface: rgba(14,14,16,0.9);
  --line: rgba(255,255,255,0.08);
  --line2: rgba(255,255,255,0.14);
  --muted: rgba(255,255,255,0.52);
  --muted2: rgba(255,255,255,0.72);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#000;color:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer;background:transparent;border:0}
a{color:inherit;text-decoration:none}
img,video{display:block;max-width:100%}
.bn{font-family:'Bebas Neue',sans-serif;letter-spacing:.06em}
@keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes pulseGlow { 0% { box-shadow: 0 0 20px rgba(229,57,53,.2); } 50% { box-shadow: 0 0 45px rgba(229,57,53,.55); } 100% { box-shadow: 0 0 20px rgba(229,57,53,.2); } }
button:active, a:active { transform: scale(0.96) !important; transition: transform 0.1s !important; }
/* ── NAV ── */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;border-bottom:1px solid var(--line);background:rgba(0,0,0,0.82);backdrop-filter:blur(20px)}
.nav-inner{max-width:1400px;margin:0 auto;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.nav-logo{display:flex;align-items:center;gap:14px}
.nav-logo-img{width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 0 16px rgba(229,57,53,.5))}
.nav-logo-text{font-family:'Bebas Neue',sans-serif;letter-spacing:.28em;font-size:1.5rem}
.nav-links{display:flex;align-items:center;gap:6px}
.nav-link{padding:8px 14px;border-radius:999px;color:var(--muted2);font-size:.88rem;transition:color .2s,background .2s}
.nav-link:hover{color:#fff;background:rgba(255,255,255,.06)}
.nav-link.active{color:#fff}
.nav-cta{position:relative;overflow:hidden;border:1px solid rgba(229,57,53,.55);border-radius:999px;padding:10px 22px;background:linear-gradient(135deg,var(--red),var(--red-dark));font-weight:600;font-size:.9rem;box-shadow:0 8px 28px rgba(229,57,53,.22);transition:transform .2s,box-shadow .2s}
.nav-cta::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,0.3),transparent);transform:skewX(-25deg);animation:btnShine 3s infinite}
@keyframes btnShine { 0%{left:-100%} 15%{left:200%} 100%{left:200%} }
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 14px 45px rgba(229,57,53,.55)}
/* ── LAYOUT ── */
.page{min-height:100vh;background:#000;overflow-x:hidden;padding-top:81px}
.section{padding:96px 32px}
.section-inner{max-width:1400px;margin:0 auto;animation:fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards}
.section-label{display:inline-flex;align-items:center;gap:12px;color:var(--red);font-family:'Bebas Neue',sans-serif;letter-spacing:.32em;font-size:.82rem;margin-bottom:14px}
.section-label::before{content:'';width:32px;height:2px;background:var(--red);flex-shrink:0}
.section-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,4.5vw,4.2rem);letter-spacing:.03em;line-height:.95;margin-bottom:16px}
.section-sub{color:var(--muted);line-height:1.75;font-size:1rem;max-width:640px}
/* ── HERO ── */
.hero{position:relative;min-height:calc(100vh - 81px);display:grid;align-items:center;overflow:hidden;background:radial-gradient(ellipse at 6% 18%,rgba(229,57,53,.22) 0%,transparent 38%),radial-gradient(ellipse at 88%52%,rgba(229,57,53,.12) 0%,transparent 32%),#020202}
.hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(229,57,53,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(229,57,53,.04) 1px,transparent 1px);background-size:80px 80px;opacity:.35}
.hero-inner{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:1.1fr .9fr;gap:60px;align-items:center;animation:fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards}
.hero-label{display:inline-flex;align-items:center;gap:14px;color:var(--red);font-family:'Bebas Neue',sans-serif;letter-spacing:.34em;font-size:.82rem}
.hero-label::before{content:'';width:44px;height:2px;background:var(--red)}
.hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(5rem,8.5vw,8.5rem);line-height:.9;letter-spacing:.02em;margin:26px 0 30px}
.hero-title .red-w{color:var(--red);position:relative;display:inline-block;animation:gf 3s ease-in-out infinite}
.hero-title .red-w::before,.hero-title .red-w::after{content:attr(data-text);position:absolute;inset:0;color:var(--red);clip-path:inset(42% 0 38% 0)}
.hero-title .red-w::before{animation:gs1 1.2s steps(2,end) infinite;text-shadow:-10px 0 #12f7ff}
.hero-title .red-w::after{animation:gs2 1.4s steps(2,end) infinite;text-shadow:10px 0 #ff3ad7}
@keyframes gf{0%,100%{transform:translateY(0)}25%{transform:translateY(-5px)}50%{transform:translateY(4px);filter:drop-shadow(0 0 14px rgba(229,57,53,.2))}75%{transform:translateY(-2px)}}
@keyframes gs1{0%,100%{transform:translate(-7px,-5px);clip-path:inset(16% 0 58% 0)}42%{transform:translate(-12px,8px);clip-path:inset(66% 0 12% 0)}82%{transform:translate(-4px,3px);clip-path:inset(52% 0 25% 0)}}
@keyframes gs2{0%,100%{transform:translate(7px,6px);clip-path:inset(52% 0 24% 0)}46%{transform:translate(11px,-7px);clip-path:inset(72% 0 8% 0)}86%{transform:translate(5px,-2px);clip-path:inset(44% 0 34% 0)}}
.hero-copy{color:var(--muted);font-size:1.06rem;line-height:1.82;max-width:680px}
.hero-actions{display:flex;flex-wrap:wrap;gap:16px;margin-top:40px;align-items:center}
.btn-primary{position:relative;overflow:hidden;border:0;border-radius:999px;padding:16px 32px;background:var(--red);font-weight:700;font-size:.95rem;box-shadow:0 0 40px rgba(229,57,53,.32);transition:transform .2s,box-shadow .2s;animation: pulseGlow 4s infinite}
.btn-primary::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,0.25),transparent);transform:skewX(-25deg);animation:btnShine 4s infinite}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 70px rgba(229,57,53,.65);animation-play-state:paused}
.btn-ghost{border:1px solid var(--line2);border-radius:999px;padding:15px 28px;font-size:.95rem;color:var(--muted2);transition:border-color .2s,color .2s,background .2s}
.btn-ghost:hover{border-color:rgba(229,57,53,.5);color:#fff;background:rgba(229,57,53,.06)}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:20px;overflow:hidden;margin-top:48px}
.hero-stat{background:#0a0a0a;padding:22px 20px;text-align:center}
.hero-stat-num{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:var(--red);letter-spacing:.04em}
.hero-stat-label{color:var(--muted);font-size:.8rem;margin-top:4px}
@keyframes floatUp { 0%, 100% { transform: translateY(0); box-shadow:0 0 80px rgba(229,57,53,.16); } 50% { transform: translateY(-12px); box-shadow:0 0 110px rgba(229,57,53,.3); } }
.hero-card{border:1px solid rgba(229,57,53,.24);border-radius:28px;padding:32px;background:linear-gradient(145deg,rgba(16,17,20,.95),rgba(4,4,4,.98));box-shadow:0 0 80px rgba(229,57,53,.16);transition:transform .35s cubic-bezier(.23,1,.32,1),border-color .35s,box-shadow .35s;transform-style:preserve-3d;animation:floatUp 6s ease-in-out infinite}
.hero-card:hover{animation-play-state:paused;transform:translateY(-8px) scale(1.02);border-color:rgba(229,57,53,.6);box-shadow:0 0 130px rgba(229,57,53,.45)}
.hero-card-head{display:flex;align-items:center;gap:16px;margin-bottom:28px;padding-bottom:22px;border-bottom:1px solid var(--line)}
.hero-card-head img{width:72px;height:72px;object-fit:contain}
.fc{border:1px solid var(--line);border-radius:16px;padding:22px;margin-bottom:14px;background:rgba(0,0,0,.38);transition:transform .25s,border-color .25s,background .25s}
.fc:last-child{margin-bottom:0}
.fc:hover{transform:translateX(8px) translateY(-2px);border-color:rgba(229,57,53,.48);background:rgba(229,57,53,.07)}
.fc h4{font-family:'Bebas Neue',sans-serif;letter-spacing:.12em;font-size:1.1rem;color:var(--red);margin-bottom:8px}
.fc p{color:var(--muted);font-size:.87rem;line-height:1.65}
/* ── MARQUEE ── */
.marquee{background:#df3c38;padding:16px 0;overflow:hidden}
.marquee-track{display:flex;gap:60px;width:max-content;animation:marquee 22s linear infinite;font-family:'Bebas Neue',sans-serif;letter-spacing:.32em;font-size:1.1rem;white-space:nowrap}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
/* ── TRUST STRIP ── */
.trust-strip{display:flex;flex-wrap:wrap;gap:24px;margin-top:52px;align-items:center}
.trust-item{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.88rem}
.trust-icon{width:36px;height:36px;border-radius:10px;background:rgba(229,57,53,.12);border:1px solid rgba(229,57,53,.24);display:flex;align-items:center;justify-content:center;font-size:1.1rem}
/* ── SERVICES GRID ── */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:48px}
.svc-card{border:1px solid var(--line);border-radius:24px;padding:28px;background:linear-gradient(145deg,rgba(18,18,20,.9),rgba(4,4,4,.95));cursor:pointer;transition:transform .25s,border-color .25s,box-shadow .25s;text-align:left;position:relative;overflow:hidden}
.svc-card::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(229,57,53,.09),transparent 60%);opacity:0;transition:opacity .3s}
.svc-card:hover::after{opacity:1}
.svc-card:hover{transform:translateY(-8px) scale(1.02);border-color:rgba(229,57,53,.6);box-shadow:0 24px 64px rgba(0,0,0,.38),0 0 0 1px rgba(229,57,53,.25)}
@keyframes iconPulse { 0% { box-shadow: 0 0 0 0 rgba(229,57,53, 0.4); } 70% { box-shadow: 0 0 0 14px rgba(229,57,53, 0); } 100% { box-shadow: 0 0 0 0 rgba(229,57,53, 0); } }
.svc-icon{width:52px;height:52px;border-radius:14px;background:rgba(229,57,53,.12);border:1px solid rgba(229,57,53,.22);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:18px;transition:all .3s}
.svc-card:hover .svc-icon{background:rgba(229,57,53,.25);transform:scale(1.1) rotate(-8deg);animation: iconPulse 1.5s infinite}
.svc-card h3{font-family:'Bebas Neue',sans-serif;letter-spacing:.08em;font-size:1.55rem;margin-bottom:10px}
.svc-card p{color:var(--muted);font-size:.88rem;line-height:1.65}
.svc-arrow{position:absolute;top:26px;right:26px;color:rgba(229,57,53,.5);font-size:1.2rem;transition:transform .2s,color .2s}
.svc-card:hover .svc-arrow{transform:translate(3px,-3px);color:var(--red)}
/* ── PROCESS ── */
.process-section{background:#050505}
.process-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin-top:52px;position:relative}
.process-steps::before{content:'';position:absolute;top:36px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(229,57,53,.4),rgba(229,57,53,.4),rgba(229,57,53,.4),transparent)}
.process-step{padding:0 14px;text-align:center;position:relative}
.ps-num{width:72px;height:72px;border-radius:50%;border:1px solid rgba(229,57,53,.38);background:linear-gradient(135deg,rgba(229,57,53,.14),rgba(0,0,0,.6));display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--red)}
.ps-title{font-family:'Bebas Neue',sans-serif;letter-spacing:.08em;font-size:1.1rem;margin-bottom:8px}
.ps-desc{color:var(--muted);font-size:.82rem;line-height:1.6}
/* ── WHY US ── */
.why-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
.why-card{border:1px solid var(--line);border-radius:22px;padding:28px;background:linear-gradient(145deg,rgba(14,14,16,.9),rgba(4,4,4,.95));transition:border-color .25s,transform .25s}
.why-card:hover{border-color:rgba(229,57,53,.42);transform:translateY(-3px)}
.why-card-head{display:flex;align-items:flex-start;gap:16px;margin-bottom:14px}
.why-icon{width:46px;height:46px;flex-shrink:0;border-radius:12px;background:rgba(229,57,53,.1);border:1px solid rgba(229,57,53,.2);display:flex;align-items:center;justify-content:center;font-size:1.3rem}
.why-card h4{font-family:'Bebas Neue',sans-serif;letter-spacing:.08em;font-size:1.3rem;margin-bottom:6px}
.why-card p{color:var(--muted);font-size:.88rem;line-height:1.65}
/* ── INDUSTRIES ── */
.industries-section{background:#080808}
.industries-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:48px}
.ind-card{border:1px solid var(--line);border-radius:18px;padding:22px 18px;background:rgba(255,255,255,.025);text-align:center;cursor:default;transition:border-color .2s,background .2s,transform .2s}
.ind-card:hover{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.12);transform:translateY(-6px) scale(1.03);box-shadow:0 14px 30px rgba(229,57,53,.1)}
.ind-card:hover .ind-emoji{transform:scale(1.2) rotate(10deg);transition:transform .3s}
.ind-emoji{font-size:2rem;margin-bottom:10px;display:block}
.ind-card h4{font-size:.9rem;font-weight:500;margin-bottom:5px}
.ind-card p{color:var(--muted);font-size:.78rem;line-height:1.5}
/* ── PRICING ── */
.pricing-section{background:#030303}
.pricing-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:36px 0 44px;justify-content:center}
.ptab{border:1px solid var(--line2);border-radius:999px;padding:10px 22px;color:var(--muted2);font-size:.88rem;transition:all .2s}
.ptab.active{border-color:rgba(229,57,53,.55);background:rgba(229,57,53,.12);color:#fff}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pricing-card{border:1px solid var(--line);border-radius:24px;padding:28px;background:linear-gradient(145deg,rgba(14,14,16,.95),rgba(4,4,4,.98));display:flex;flex-direction:column;gap:0;position:relative;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
.pricing-card:hover{transform:translateY(-6px);border-color:rgba(229,57,53,.45);box-shadow:0 32px 72px rgba(0,0,0,.45)}
.pricing-card.featured{border-color:rgba(229,57,53,.55);box-shadow:0 0 60px rgba(229,57,53,.14)}
.pricing-badge{position:absolute;top:0;right:0;background:var(--red);color:#fff;font-family:'Bebas Neue',sans-serif;letter-spacing:.12em;font-size:.78rem;padding:6px 16px;border-radius:0 22px 0 14px}
.pricing-plan{color:var(--muted);font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
.pricing-name{font-family:'Bebas Neue',sans-serif;letter-spacing:.06em;font-size:1.9rem;margin-bottom:6px}
.pricing-desc{color:var(--muted);font-size:.84rem;line-height:1.6;margin-bottom:22px}
.pricing-price{margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid var(--line)}
.pricing-amount{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:.02em;color:#fff}
.pricing-amount span{font-size:1.4rem;vertical-align:top;margin-top:8px;display:inline-block;margin-right:4px;color:var(--red)}
.pricing-period{font-size:.84rem;color:var(--muted);margin-left:6px;font-family:'DM Sans',sans-serif;letter-spacing:0;font-weight:400;font-size:.82rem}
.pricing-starting{font-size:.76rem;color:var(--muted);margin-top:4px}
.pricing-features{list-style:none;display:flex;flex-direction:column;gap:10px;flex:1;margin-bottom:24px}
.pricing-features li{display:flex;align-items:flex-start;gap:10px;font-size:.88rem;color:var(--muted2);line-height:1.45}
.pricing-features li::before{content:'✓';color:var(--red);font-weight:700;flex-shrink:0;margin-top:1px}
.pricing-cta{width:100%;border-radius:999px;padding:14px;font-weight:600;font-size:.92rem;transition:all .2s}
.pricing-cta.primary{background:linear-gradient(135deg,var(--red),var(--red-dark));border:0;box-shadow:0 10px 28px rgba(229,57,53,.25)}
.pricing-cta.primary:hover{box-shadow:0 14px 38px rgba(229,57,53,.38);transform:translateY(-1px)}
.pricing-cta.secondary{background:transparent;border:1px solid var(--line2);color:var(--muted2)}
.pricing-cta.secondary:hover{border-color:rgba(229,57,53,.45);color:#fff;background:rgba(229,57,53,.08)}
.pricing-best{font-size:.78rem;color:var(--muted);margin-top:14px;text-align:center}
/* ── PORTFOLIO / CASE STUDIES ── */
.portfolio-section{background:#060606}
.portfolio-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.port-card{border:1px solid var(--line);border-radius:24px;overflow:hidden;background:rgba(255,255,255,.025);cursor:pointer;transition:transform .25s,border-color .25s,box-shadow .25s}
.port-card:hover{transform:translateY(-5px);border-color:rgba(229,57,53,.48);box-shadow:0 28px 70px rgba(0,0,0,.4)}
.port-media{position:relative;height:220px;overflow:hidden}
.port-media img,.port-media video{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.port-card:hover .port-media img,.port-card:hover .port-media video{transform:scale(1.06)}
.port-media::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent)}
.port-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);width:60px;height:60px;background:rgba(229,57,53,.95);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:#fff;z-index:3;opacity:0;transition:all .3s cubic-bezier(.23,1,.32,1);box-shadow:0 0 35px rgba(229,57,53,.6)}
.port-card:hover .port-play-btn{opacity:1;transform:translate(-50%,-50%) scale(1)}
.port-tag{position:absolute;top:14px;left:14px;z-index:4;background:rgba(229,57,53,.88);border-radius:999px;padding:5px 12px;font-size:.76rem;font-weight:600;backdrop-filter:blur(6px)}
.port-body{padding:20px}
.port-client{font-size:.76rem;color:var(--muted);margin-bottom:6px;letter-spacing:.08em;text-transform:uppercase}
.port-body h3{font-family:'Bebas Neue',sans-serif;letter-spacing:.06em;font-size:1.5rem;margin-bottom:8px}
.port-body p{color:var(--muted);font-size:.85rem;line-height:1.6;margin-bottom:14px}
.port-results{display:flex;gap:16px;flex-wrap:wrap}
.port-result{background:rgba(229,57,53,.1);border:1px solid rgba(229,57,53,.22);border-radius:10px;padding:6px 12px;font-size:.78rem;color:rgba(255,200,200,.9)}
/* ── CASE STUDY MODAL ── */
.modal-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.88);backdrop-filter:blur(16px);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto}
.modal{width:min(860px,100%);background:linear-gradient(145deg,rgba(14,14,16,.98),rgba(6,6,8,.99));border:1px solid var(--line2);border-radius:28px;padding:32px;margin:auto}
.modal-close{position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;font-size:1.2rem;transition:background .2s}
.modal-close:hover{background:rgba(229,57,53,.2)}
.cs-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}
.cs-block{background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:16px;padding:18px}
.cs-block h4{font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;font-size:1.1rem;color:var(--red);margin-bottom:8px}
.cs-block p{color:var(--muted2);font-size:.88rem;line-height:1.65}
.cs-tech{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.cs-tag{background:rgba(255,255,255,.07);border:1px solid var(--line2);border-radius:8px;padding:5px 12px;font-size:.78rem;color:var(--muted2)}
.cs-results-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}
.cs-result-card{background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.22);border-radius:14px;padding:16px;text-align:center}
.cs-result-num{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--red);letter-spacing:.04em}
.cs-result-label{color:var(--muted);font-size:.78rem;margin-top:4px}
/* ── ESTIMATOR ── */
.estimator-section{background:#040404}
.estimator-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:32px;margin-top:48px;align-items:start}
.estimator-card{border:1px solid var(--line2);border-radius:24px;padding:30px;background:rgba(10,10,12,.8)}
.est-step{margin-bottom:24px}
.est-step-label{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.est-options{display:flex;flex-wrap:wrap;gap:8px}
.est-opt{border:1px solid var(--line2);border-radius:12px;padding:8px 16px;font-size:.86rem;color:var(--muted2);transition:all .2s}
.est-opt.sel{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.12);color:#fff}
.est-opt:hover:not(.sel){border-color:rgba(255,255,255,.22);color:#fff}
.estimate-result{border:1px solid rgba(229,57,53,.38);border-radius:24px;padding:30px;background:linear-gradient(145deg,rgba(229,57,53,.07),rgba(14,14,16,.95));position:sticky;top:100px}
.est-range{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;color:var(--red);letter-spacing:.02em;margin:14px 0 8px}
.est-timeline{display:flex;align-items:center;gap:10px;color:var(--muted2);font-size:.9rem;margin-bottom:20px}
.est-breakdown{margin-top:18px;display:flex;flex-direction:column;gap:8px}
.est-row{display:flex;justify-content:space-between;font-size:.86rem;color:var(--muted);padding:8px 0;border-bottom:1px solid var(--line)}
.est-row:last-child{border-bottom:0;color:var(--muted2);font-weight:500}
/* ── TESTIMONIALS ── */
.testimonials-section{background:#070707}
.testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:48px}
.testi-card{border:1px solid var(--line);border-radius:22px;padding:26px;background:linear-gradient(145deg,rgba(14,14,16,.9),rgba(4,4,4,.95));transition:transform .25s,border-color .25s}
.testi-card:hover{transform:translateY(-4px);border-color:rgba(229,57,53,.38)}
.testi-stars{display:flex;gap:4px;margin-bottom:14px;color:var(--red)}
.testi-quote{color:var(--muted2);font-size:.9rem;line-height:1.72;margin-bottom:20px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--red-dark));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.95rem;flex-shrink:0}
.testi-name{font-weight:500;font-size:.9rem;margin-bottom:2px}
.testi-biz{color:var(--muted);font-size:.78rem}
.testi-tag{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);display:flex;gap:8px}
.testi-pill{background:rgba(229,57,53,.1);border:1px solid rgba(229,57,53,.2);border-radius:999px;padding:4px 10px;font-size:.72rem;color:rgba(255,180,180,.8)}
/* ── STATS / COUNTERS ── */
.stats-section{background:linear-gradient(135deg,rgba(229,57,53,.06),rgba(0,0,0,.6));border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;text-align:center}
.stat-item{padding:40px 20px;border-right:1px solid var(--line);cursor:pointer;transition:background .2s}
.stat-item:last-child{border-right:0}
.stat-item:hover{background:rgba(229,57,53,.06)}
.stat-num{font-family:'Bebas Neue',sans-serif;font-size:3.5rem;color:var(--red);letter-spacing:.02em;line-height:1}
.stat-suffix{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--red)}
.stat-label{color:var(--muted);font-size:.86rem;margin-top:8px}
/* ── CTA BAND ── */
.cta-band{background:linear-gradient(135deg,rgba(229,57,53,.14),rgba(0,0,0,.8));border-top:1px solid rgba(229,57,53,.22);border-bottom:1px solid rgba(229,57,53,.22);padding:72px 32px;text-align:center}
.cta-band h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,4vw,4.2rem);letter-spacing:.04em;margin-bottom:14px}
.cta-band p{color:var(--muted);max-width:560px;margin:0 auto 32px;font-size:1.02rem;line-height:1.75}
.cta-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
/* ── FOOTER ── */
.footer{background:#000;border-top:1px solid var(--line);padding:48px 32px 28px}
.footer-inner{max-width:1400px;margin:0 auto}
.footer-top{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px;margin-bottom:36px}
.footer-brand p{color:var(--muted);font-size:.86rem;line-height:1.7;margin-top:12px;max-width:300px}
.footer-col h5{font-family:'Bebas Neue',sans-serif;letter-spacing:.12em;font-size:1rem;margin-bottom:14px;color:rgba(255,255,255,.7)}
.footer-col a{display:block;color:var(--muted);font-size:.86rem;margin-bottom:9px;transition:color .2s}
.footer-col a:hover{color:var(--red)}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:22px;border-top:1px solid var(--line);flex-wrap:wrap;gap:12px}
.footer-bottom p{color:var(--muted);font-size:.82rem}
/* ── TOAST ── */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120%);background:rgba(229,57,53,.9);color:#fff;border-radius:999px;padding:12px 24px;font-size:.9rem;font-weight:500;z-index:999;transition:transform .4s cubic-bezier(.23,1,.32,1);backdrop-filter:blur(10px)}
.toast.show{transform:translateX(-50%) translateY(0)}
/* ── MULTISTEP FORM ── */
.msf-backdrop{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.88);backdrop-filter:blur(14px);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto}
.msf-modal{width:min(780px,100%);background:linear-gradient(145deg,rgba(12,12,14,.99),rgba(4,4,6,.99));border:1px solid var(--line2);border-radius:28px;padding:36px;margin:auto}
.msf-progress{display:flex;gap:0;margin-bottom:32px}
.msf-step-dot{flex:1;height:3px;background:rgba(255,255,255,.1);transition:background .3s}
.msf-step-dot.done{background:var(--red)}
.msf-step-dot.active{background:rgba(229,57,53,.55)}
.msf-step-label{display:flex;justify-content:space-between;margin-bottom:8px}
.msf-step-label span{font-size:.76rem;color:var(--muted);letter-spacing:.06em}
.msf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
.svc-select{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.svc-sel-btn{border:1px solid var(--line2);border-radius:16px;padding:18px 14px;text-align:center;font-size:.84rem;cursor:pointer;transition:all .2s;color:var(--muted2)}
.svc-sel-btn.sel{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.1);color:#fff}
.svc-sel-btn .svc-sel-icon{font-size:1.6rem;display:block;margin-bottom:8px}
.budget-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.budget-opt{border:1px solid var(--line2);border-radius:12px;padding:12px;text-align:center;font-size:.84rem;cursor:pointer;transition:all .2s;color:var(--muted2)}
.budget-opt.sel{border-color:rgba(229,57,53,.55);background:rgba(229,57,53,.1);color:#fff}
.msf-nav{display:flex;justify-content:space-between;gap:12px;margin-top:28px}
/* ── FIELD ── */
.field{display:grid;gap:7px;margin-bottom:16px}
.field label{font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.field input,.field select,.field textarea{width:100%;border:1px solid var(--line2);border-radius:14px;background:rgba(255,255,255,.05);color:#fff;padding:13px 15px;outline:0;transition:border-color .2s}
.field input:focus,.field select:focus,.field textarea:focus{border-color:rgba(229,57,53,.55)}
.field textarea{min-height:90px;resize:vertical}
.field select option{background:#111;color:#fff}
/* ── WORKSPACE ── */
.workspace{min-height:100vh;display:grid;grid-template-columns:280px 1fr;background:#000}
.sidebar{border-right:1px solid var(--line);background:rgba(0,0,0,.6);backdrop-filter:blur(20px);position:sticky;top:0;height:100vh;overflow-y:auto;padding:24px}
.sidebar-logo{display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.sidebar-logo img{width:46px;height:46px;object-fit:contain}
.sidebar-nav{display:flex;flex-direction:column;gap:4px}
.snav-btn{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:14px;color:var(--muted2);font-size:.9rem;transition:all .2s;text-align:left;width:100%}
.snav-btn:hover{background:rgba(255,255,255,.06);color:#fff}
.snav-btn.active{background:rgba(229,57,53,.12);border:1px solid rgba(229,57,53,.28);color:#fff}
.snav-icon{font-size:1.1rem;width:22px;text-align:center}
.snav-badge{margin-left:auto;background:var(--red);color:#fff;border-radius:999px;padding:2px 8px;font-size:.7rem;font-weight:700}
.workspace-content{padding:28px;display:flex;flex-direction:column;gap:20px;overflow-y:auto;height:100vh}
.ws-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.ws-title{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:.06em}
.ws-grid{display:grid;grid-template-columns:380px 1fr;gap:20px;min-height:0;flex:1}
.proj-list-panel{border:1px solid var(--line);border-radius:22px;padding:18px;background:rgba(8,8,10,.8);overflow-y:auto;max-height:calc(100vh - 200px)}
.proj-item{border:1px solid var(--line);border-radius:16px;padding:15px;text-align:left;width:100%;margin-bottom:10px;cursor:pointer;transition:all .2s}
.proj-item:hover{border-color:rgba(229,57,53,.4)}
.proj-item.active{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.08)}
.proj-item h4{font-size:.94rem;font-weight:500;margin-bottom:5px}
.proj-item p{color:var(--muted);font-size:.8rem}
.proj-status{display:inline-block;border-radius:999px;padding:3px 10px;font-size:.72rem;font-weight:600;margin-top:6px}
.status-new{background:rgba(59,130,246,.15);color:#93c5fd;border:1px solid rgba(59,130,246,.25)}
.status-active{background:rgba(229,57,53,.1);color:#fca5a5;border:1px solid rgba(229,57,53,.2)}
.status-done{background:rgba(34,197,94,.1);color:#86efac;border:1px solid rgba(34,197,94,.2)}
.chat-panel{border:1px solid var(--line);border-radius:22px;background:rgba(6,6,8,.85);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;max-height:calc(100vh - 200px)}
.chat-head{padding:18px 22px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between}
.chat-body{padding:18px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
.bubble{max-width:74%;border-radius:16px;padding:11px 14px;font-size:.9rem;line-height:1.55}
.bubble small{display:block;font-size:.7rem;color:rgba(255,255,255,.45);margin-bottom:4px}
.bubble.client{align-self:flex-end;background:linear-gradient(135deg,var(--red),var(--red-dark))}
.bubble.team{align-self:flex-start;background:rgba(255,255,255,.07);border:1px solid var(--line)}
.bubble.system{align-self:center;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.18);color:var(--muted2);font-size:.8rem;max-width:90%}
.composer{border-top:1px solid var(--line);padding:14px;display:flex;gap:10px}
.composer input{flex:1;border:1px solid var(--line2);border-radius:999px;background:rgba(255,255,255,.06);color:#fff;padding:12px 16px;outline:0;transition:border-color .2s}
.composer input:focus{border-color:rgba(229,57,53,.5)}
.ws-timeline{border:1px solid var(--line);border-radius:22px;padding:22px;background:rgba(8,8,10,.8)}
.timeline-items{display:flex;flex-direction:column;gap:0;margin-top:16px;position:relative}
.timeline-items::before{content:'';position:absolute;left:16px;top:0;bottom:0;width:1px;background:var(--line)}
.tl-item{padding-left:42px;padding-bottom:20px;position:relative}
.tl-dot{position:absolute;left:9px;top:3px;width:15px;height:15px;border-radius:50%;border:2px solid var(--line2);background:#000;transition:background .3s,border-color .3s}
.tl-item.done .tl-dot{background:var(--red);border-color:var(--red)}
.tl-item.active .tl-dot{background:rgba(229,57,53,.3);border-color:var(--red);box-shadow:0 0 10px rgba(229,57,53,.4)}
.tl-title{font-size:.9rem;font-weight:500;margin-bottom:3px}
.tl-date{font-size:.78rem;color:var(--muted)}
/* ── LOGIN ── */
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 30%,rgba(229,57,53,.18) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(229,57,53,.1) 0%,transparent 45%),#010101;position:relative;overflow:hidden}
.login-page::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(229,57,53,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(229,57,53,.03) 1px,transparent 1px);background-size:60px 60px}
.login-card{position:relative;z-index:1;width:min(440px,92vw);background:linear-gradient(145deg,rgba(14,14,16,.98),rgba(4,4,6,.99));border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:40px;box-shadow:0 0 100px rgba(229,57,53,.12)}
.login-tabs{display:flex;gap:4px;background:rgba(255,255,255,.05);border-radius:14px;padding:4px;margin-bottom:28px}
.login-tab{flex:1;padding:10px;border-radius:10px;font-size:.88rem;color:var(--muted2);transition:all .2s;font-weight:500}
.login-tab.active{background:var(--red);color:#fff}
.google-btn{width:100%;border:1px solid var(--line2);border-radius:14px;padding:13px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:.92rem;color:var(--muted2);transition:all .2s;margin-bottom:18px}
.google-btn:hover{border-color:rgba(229,57,53,.5);color:#fff;background:rgba(229,57,53,.06)}
.divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--muted);font-size:.8rem}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--line)}
/* ── SERVICE PAGE ── */
.service-page-hero{background:radial-gradient(ellipse at 15% 20%,rgba(229,57,53,.2) 0%,transparent 40%),#030303;padding:80px 32px;border-bottom:1px solid var(--line)}
.service-page-back{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font-size:.88rem;margin-bottom:32px;cursor:pointer;transition:color .2s}
.service-page-back:hover{color:var(--red)}
.service-portfolio-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.svc-port-empty{text-align:center;padding:80px 32px;color:var(--muted);border:1px dashed rgba(255,255,255,.12);border-radius:22px;grid-column:1/-1}
/* ── TEAM WORKSPACE ── */
.team-ws-cats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
.team-cat-btn{border:1px solid var(--line2);border-radius:999px;padding:8px 18px;font-size:.84rem;color:var(--muted2);transition:all .2s}
.team-cat-btn.active{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.12);color:#fff}
.client-list{display:flex;flex-direction:column;gap:10px}
.client-row{border:1px solid var(--line);border-radius:14px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .2s}
.client-row:hover{border-color:rgba(229,57,53,.4);background:rgba(229,57,53,.04)}
.client-row.active{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.08)}
.client-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--red-dark));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;flex-shrink:0}
/* ── PORTFOLIO UPLOAD ── */
.port-upload-form{border:1px solid var(--line2);border-radius:22px;padding:28px;background:rgba(10,10,12,.8);margin-bottom:24px}
.drop-zone{border:2px dashed rgba(229,57,53,.3);border-radius:14px;padding:32px;text-align:center;cursor:pointer;transition:all .2s}
.drop-zone:hover{border-color:rgba(229,57,53,.6);background:rgba(229,57,53,.04)}
/* ── FEEDBACK FORM ── */
.feedback-form{border:1px solid var(--line2);border-radius:22px;padding:28px;background:rgba(10,10,12,.8)}
/* ── RESPONSIVE ── */
@media(max-width:1080px){
  .hero-inner{grid-template-columns:1fr;gap:40px}
  .services-grid,.pricing-grid{grid-template-columns:repeat(2,1fr)}
  .industries-grid{grid-template-columns:repeat(3,1fr)}
  .process-steps{grid-template-columns:repeat(3,1fr)}
  .process-steps::before{display:none}
  .estimator-wrap{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .stat-item:nth-child(2){border-right:0}
  .footer-top{grid-template-columns:1fr 1fr}
  .workspace{grid-template-columns:1fr}
  .sidebar{position:relative;height:auto}
  .ws-grid{grid-template-columns:1fr}
}
@media(max-width:700px){
  .nav-links{display:none}
  .services-grid,.pricing-grid,.portfolio-grid,.testimonials-grid,.industries-grid,.service-portfolio-grid{grid-template-columns:1fr}
  .process-steps{grid-template-columns:1fr 1fr}
  .why-grid,.cs-grid,.cs-results-row,.msf-grid,.svc-select,.budget-opts{grid-template-columns:1fr}
  .section{padding:64px 18px}
  .hero-inner{padding:48px 18px}
  .footer-top{grid-template-columns:1fr}
  .hero-stats{grid-template-columns:1fr 1fr 1fr}
  .stats-grid{grid-template-columns:1fr 1fr}
}
`;
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Services","Process","Pricing","Portfolio","Testimonials"];
const NAV_PAGE_MAP = {
  Services: ["services-list", "service"],
  Process: ["process"],
  Pricing: ["pricing"],
  Portfolio: ["portfolio"],
  Testimonials: ["testimonials"],
};
const LOGO_URL = logoUrl;
const TEAM_ID = "1234567890";
const SERVICE_MAP = {
  "Video Editing": "Video Editing",
  "Web Dev": "Web Development",
  "App Dev": "App Development",
  "Game Dev": "Game Development",
  "Marketing": "Marketing",
};
const SERVICES = [
  {icon:"🎬",title:"Video Editing",desc:"High-retention editing, reels, cinematic cuts, and motion graphics crafted for maximum engagement.",key:"video"},
  {icon:"🌐",title:"Web Development",desc:"Modern responsive websites that convert visitors into clients. From landing pages to full business sites.",key:"web"},
  {icon:"📱",title:"App Development",desc:"iOS and Android apps with beautiful UX, real-time systems, and scalable backends.",key:"app"},
  {icon:"🎮",title:"Game Development",desc:"Promotional games, 2D/3D titles, and cross-platform gaming experiences.",key:"game"},
  {icon:"📈",title:"Marketing",desc:"Ad creatives, social media management, analytics strategy, and growth campaigns.",key:"marketing"},
];
const VIDEO_FILE_META = {
  "BATCH 2.0.mp4": { title:"BATCH 2.0 – Cinematic Cut", client:"Real Media", desc:"Full cinematic production with premium transitions and color grading.", outcome:"Viral reach across multiple platforms" },
  "BRONZE TO HEROIC Journey Begins! _ Free Fire Ranked Push Series Day 1.mp4": { title:"Bronze to Heroic Journey", client:"Free Fire Gaming", desc:"Gaming highlight reel with dynamic editing, speed ramps, and motion graphics.", outcome:"10K+ views in first 48 hours" },
  "CORECT DR SABRINA.mp4": { title:"Dr. Sabrina – Official", client:"Real Media", desc:"Professionally edited music video with color correction and effects.", outcome:"Premium brand content delivered" },
  "GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4": { title:"Game Change – Music Video", client:"Real Media Productions", desc:"Full music video production with cinematic visuals and professional editing.", outcome:"Official release content" },
  "MINE OFFICIAI TRAILER .mp4": { title:"Mine – Official Trailer", client:"Real Media", desc:"High-impact trailer cut with dramatic pacing, SFX, and visual storytelling.", outcome:"Theatrical trailer quality achieved" },
  "Tech and policy Sybercecurity project .mp4": { title:"Tech & Cybersecurity Project", client:"Corporate Client", desc:"Professional explainer video with motion graphics and clean editing.", outcome:"Corporate presentation delivered" },
  "I Moved at the WRONG Time in Roblox Squid Game… 😰.mp4": { title:"Roblox Squid Game Edit", client:"Gaming Client", desc:"Fast-paced gaming edit with retention-focused cuts.", outcome:"High engagement content" },
};
const videoAssetModules = import.meta.glob('./assets/*.{mp4,MP4}', { eager: true, query: '?url', import: 'default' });
const VIDEO_ASSETS = Object.entries(videoAssetModules).map(([path, url], i) => {
  const file = path.split('/').pop();
  const meta = VIDEO_FILE_META[file] || {};
  return {
    id: `video-asset-${i}`,
    title: meta.title || `Short Video ${i + 1}`,
    client: meta.client || "Real Media",
    service: "Video Editing",
    file,
    fileUrl: url,
    desc: meta.desc || "Professional video editing by Real Media.",
    outcome: meta.outcome || "Premium content delivered",
  };
});
function mergePortfolioForService(serviceTitle, apiPortfolio = []) {
  const apiForService = apiPortfolio.filter((p) => p.service === serviceTitle);
  if (serviceTitle !== "Video Editing") return apiForService;
  const seen = new Set(apiForService.map((p) => (p.title || "").toLowerCase()));
  const assets = VIDEO_ASSETS.filter((a) => !seen.has(a.title.toLowerCase()));
  return [...apiForService, ...assets];
}
function mergeAllPortfolio(apiPortfolio = []) {
  const videoItems = mergePortfolioForService("Video Editing", apiPortfolio);
  const otherItems = apiPortfolio.filter((p) => p.service !== "Video Editing");
  return [...videoItems, ...otherItems];
}
function isDeletablePortfolioItem(item) {
  return Boolean(item?.id?.startsWith("portfolio_"));
}
const PROCESS_STEPS = [
  {num:"01",title:"Discovery Call",desc:"We understand your goals, audience, and vision in a free 30-minute strategy session."},
  {num:"02",title:"Strategy & Brief",desc:"Our team builds a detailed creative brief and project roadmap tailored to your objectives."},
  {num:"03",title:"Production",desc:"Design, development, or filming begins with regular check-ins and milestone updates."},
  {num:"04",title:"Review & Revise",desc:"You review the work and request revisions until every detail is exactly right."},
  {num:"05",title:"Delivery & Launch",desc:"Final deliverables are handed over with a launch plan and post-delivery support."},
];
const WHY_US = [
  {icon:"⚡",title:"Fast Turnaround",desc:"Most projects delivered within committed timelines. Rush options available for urgent campaigns."},
  {icon:"🎯",title:"Results-Focused",desc:"Every deliverable is built around measurable outcomes — views, conversions, and growth."},
  {icon:"🌍",title:"Global Standards",desc:"International-level production quality at honest Indian market pricing."},
  {icon:"🤝",title:"Dedicated Manager",desc:"Every client gets a dedicated project handler as their single point of contact."},
  {icon:"🔄",title:"Revision Policy",desc:"We include structured revisions in every plan — your satisfaction is non-negotiable."},
  {icon:"📊",title:"Transparent Reporting",desc:"Regular project updates, analytics reports, and status tracking in your client dashboard."},
];
const INDUSTRIES = [
  {emoji:"🏋️",title:"Gyms & Fitness",desc:"Membership content, trainers, classes"},
  {emoji:"☕",title:"Cafes & Restaurants",desc:"Menu reels, ambiance, promotions"},
  {emoji:"🏫",title:"Coaching & Education",desc:"Student portals, courses, content"},
  {emoji:"🏠",title:"Real Estate",desc:"Property tours, cinematic videos"},
  {emoji:"👗",title:"Fashion & Retail",desc:"Product shoots, ecommerce, lookbooks"},
  {emoji:"💊",title:"Healthcare & Wellness",desc:"Explainer videos, trust-building"},
  {emoji:"🖥️",title:"Tech & Startups",desc:"App demos, pitch decks, SaaS videos"},
  {emoji:"🏦",title:"Finance & Legal",desc:"Explainer content, trust-building"},
];
const TESTIMONIALS_STATIC = [
  {name:"Arjun Mehta",biz:"Gym Owner, Mumbai",initials:"AM",quote:"Real Media transformed our social presence completely. The reels they create get 10x more engagement than anything we did before. Our membership inquiries doubled in 2 months.",tag:"Video Editing",result:"2x Leads"},
  {name:"Priya Sharma",biz:"Coaching Institute, Delhi",initials:"PS",quote:"They built our entire student portal from scratch — attendance, assignments, video classes. The quality is international-level. Worth every rupee.",tag:"Web Development",result:"500+ Students"},
  {name:"Ravi Kapoor",biz:"Property Developer, Pune",initials:"RK",quote:"The cinematic property tour they produced has been our best marketing asset. Multiple closings attributed directly to that video. Absolutely professional team.",tag:"Video Production",result:"₹2Cr Closing"},
  {name:"Sneha Gupta",biz:"Café Chain, Bangalore",initials:"SG",quote:"Our Instagram went from 800 to 1K followers fast and kept growing. Every reel they create hits. The content plan is strategic and consistent.",tag:"Marketing",result:"1K Followers"},
  {name:"Mohit Singh",biz:"E-commerce Brand, Jaipur",initials:"MS",quote:"The ecommerce website they built handles our entire catalog and payments seamlessly. Sales increased by 180% after launch. Incredibly smooth experience.",tag:"Web Development",result:"180% Sales"},
  {name:"Aditi Verma",biz:"Mobile App Startup",initials:"AV",quote:"From wireframe to App Store in 14 weeks. The app is fast, beautiful, and exactly what we needed. Real Media delivered on every promise they made.",tag:"App Development",result:"4.8★ App"},
];
const PRICING_CATEGORIES = ["Video Editing","Websites","Apps","Games","Marketing"];
const PRICING_DATA = {
  "Video Editing":[
    {name:"Basic Edit",plan:"Per Video",price:"₹1,499",period:"/video",badge:null,desc:"Clean and professional editing for standard content.",features:["Clean editing","Captions","Music sync","Simple transitions"],cta:"Order Now",best:"For standard social media content"},
    {name:"Professional Edit",plan:"Per Video",price:"₹4,999",period:"/video",badge:"Most Popular",desc:"High-retention editing with motion graphics.",features:["Motion graphics","Speed ramps","Sound design","Retention-focused editing","Advanced subtitles"],cta:"Book Edit",best:"For YouTube, reels & branded content"},
    {name:"Cinematic Ad",plan:"Per Video",price:"₹14,999",period:"+",badge:null,desc:"Commercial-grade editing for brand campaigns.",features:["Commercial-style editing","Premium transitions","Storytelling structure","Color grading","Brand-focused editing"],cta:"Start Project",best:"For ads, launches & premium campaigns",starting:true},
  ],
  "Websites":[
    {name:"Business Website",plan:"One-Time",price:"₹24,999",period:"+",badge:null,desc:"Professional business website to build your online presence.",features:["Responsive design","Up to 5 pages","SEO basics","Contact form","Modern UI"],cta:"Build Now",best:"For local businesses & service providers",starting:true},
    {name:"Premium Website",plan:"One-Time",price:"₹59,999",period:"+",badge:"Most Popular",desc:"Custom UI/UX with advanced animations and CMS.",features:["Custom UI/UX design","Advanced animations","CMS dashboard","Premium responsive design","SEO optimization"],cta:"Get Premium",best:"For professional businesses & agencies",starting:true},
    {name:"Ecommerce Store",plan:"One-Time",price:"₹99,999",period:"+",badge:null,desc:"Full-featured online store ready to sell.",features:["Payment gateway integration","Admin dashboard","Product management system","Inventory management","Authentication system"],cta:"Build Store",best:"For product brands & D2C companies",starting:true},
  ],
  "Apps":[
    {name:"MVP App",plan:"One-Time",price:"₹1,99,999",period:"+",badge:null,desc:"Minimum viable mobile app for Android & iOS.",features:["Android/iOS support","Authentication","API integration","Clean modern UI"],cta:"Build MVP",best:"For startups & new app ideas",starting:true},
    {name:"Full App",plan:"One-Time",price:"₹3,49,999",period:"+",badge:"Most Popular",desc:"Full-featured production app with backend.",features:["Real-time systems","Push notifications","Admin panel","Scalable architecture","Multi-platform"],cta:"Build App",best:"For established businesses",starting:true},
    {name:"Enterprise App",plan:"One-Time",price:"₹5,99,999",period:"+",badge:null,desc:"Complex enterprise-grade application.",features:["Advanced backend","Multiple user roles","Analytics dashboard","Custom APIs","Security features"],cta:"Contact Us",best:"For large businesses & platforms",starting:true},
  ],
  "Games":[
    {name:"Promotional Game",plan:"One-Time",price:"₹79,999",period:"+",badge:null,desc:"Branded mobile game for marketing campaigns.",features:["Simple gameplay","Brand integration","Mobile optimized"],cta:"Start Game",best:"For brand campaigns & events",starting:true},
    {name:"2D Game",plan:"One-Time",price:"₹2,99,999",period:"+",badge:"Most Popular",desc:"Full 2D game with backend and multiplayer.",features:["2D assets","Multiplayer systems","Leaderboard","In-app purchases","Cross-platform"],cta:"Build Game",best:"For indie studios & brands",starting:true},
    {name:"3D Game",plan:"One-Time",price:"₹4,99,999",period:"+",badge:null,desc:"Multiplayer 3D game with full backend.",features:["3D assets","Multiplayer systems","Backend integration","Cross-platform support"],cta:"Build 3D Game",best:"For gaming studios & brands",starting:true},
  ],
  "Marketing":[
    {name:"Starter Growth",plan:"Content",price:"₹12,999",period:"/month",badge:null,desc:"Perfect for local businesses building their social presence.",features:["8 reels/month","Basic editing & captions","Content planning calendar","Social media post designs","3-day delivery"],cta:"Get Started",best:"For small businesses & local shops"},
    {name:"Business Growth",plan:"Content",price:"₹24,999",period:"/month",badge:"Most Popular",desc:"All-inclusive social media management for serious brands.",features:["16 reels/month","Advanced editing & motion graphics","Speed ramps & sound design","Thumbnail & post design","Monthly strategy call","Instagram management"],cta:"Start Growing",best:"For gyms, cafes, coaching, property dealers"},
    {name:"Domination",plan:"Content",price:"₹49,999",period:"/month",badge:null,desc:"Full-scale social domination for fast-growing brands.",features:["30 reels/month","Cinematic content production","Full social media management","Ad creatives included","Advanced motion graphics","Analytics reporting","Dedicated manager"],cta:"Dominate Now",best:"For growing brands & companies"},
  ],
};
const ESTIMATOR_CONFIG = {
  service: ["Video Editing","Website","Web App","Mobile App","Game Development","Marketing"],
  complexity: ["Simple / MVP","Standard","Advanced","Enterprise / Custom"],
  features: ["Authentication","Dashboard","Payments","API Integration","Admin Panel","CMS","Real-time Features","Analytics"],
  timeline: ["Rush (1-2 weeks)","Standard (4-6 weeks)","Extended (2-3 months)","Flexible"],
};
const ESTIMATE_MAP = {
  "Video Editing":{min:1500,max:20000,time:"3-10 days"},
  "Website":{min:25000,max:120000,time:"4-8 weeks"},
  "Web App":{min:150000,max:600000,time:"8-20 weeks"},
  "Mobile App":{min:200000,max:650000,time:"10-18 weeks"},
  "Game Development":{min:80000,max:600000,time:"12-24 weeks"},
  "Marketing":{min:13000,max:50000,time:"Monthly"},
};
const COMPLEXITY_MULT = {"Simple / MVP":1,"Standard":1.5,"Advanced":2.2,"Enterprise / Custom":3.5};
const TIMELINE_MULT = {"Rush (1-2 weeks)":1.5,"Standard (4-6 weeks)":1,"Extended (2-3 months)":0.85,"Flexible":0.9};
const TEAM_CATEGORIES = ["All","Video Editing","Web Development","App Development","Game Development","Marketing"];
// Demo data for workspace
const DEMO_PROJECTS = [
  {id:"1",title:"Brand Growth Content Plan",service:"Marketing",clientId:"c1",clientName:"Arjun Mehta",status:"In production",messages:[{id:"1",role:"system",text:"Project created and handler assigned."},{id:"2",role:"team",name:"Rahul (Handler)",text:"Hey! Got your brief. Let's start with the first batch of 8 reels."},{id:"3",role:"client",name:"Arjun Mehta",text:"Sounds great, excited to get started!"}],timeline:[{label:"Brief Submitted",done:true},{label:"Handler Assigned",done:true},{label:"Content Plan Shared",done:true},{label:"First Batch Production",active:true},{label:"Review & Delivery",done:false}]},
  {id:"2",title:"Business Website Redesign",service:"Web Development",clientId:"c2",clientName:"Priya Sharma",status:"First draft shared",messages:[{id:"1",role:"system",text:"Project created."},{id:"2",role:"team",name:"Priya (Developer)",text:"Your website draft is live on the staging link I sent. Please review and list your feedback."}],timeline:[{label:"Brief Submitted",done:true},{label:"Design Mockup",done:true},{label:"Development",done:true},{label:"Draft Review",active:true},{label:"Launch",done:false}]},
  {id:"3",title:"Game Development – Promo",service:"Game Development",clientId:"c3",clientName:"Ravi Kapoor",status:"New brief submitted",messages:[{id:"1",role:"system",text:"Project brief received. A project handler will review it shortly."}],timeline:[{label:"Brief Submitted",done:true},{label:"Handler Assigned",done:false},{label:"Design Phase",done:false},{label:"Development",done:false},{label:"Launch",done:false}]},
];
// ─── UTILITIES ────────────────────────────────────────────────────────────────
function formatIndian(n){if(n>=10000000)return`₹${(n/10000000).toFixed(1)}Cr`;if(n>=100000)return`₹${(n/100000).toFixed(n%100000===0?0:1)}L`;if(n>=1000)return`₹${Math.round(n/1000)}K`;return`₹${n}`}
function useCountUp(target, duration=1800){
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const obs = new IntersectionObserver(([e])=>{
      if(!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = ()=>{
        const p = Math.min((Date.now()-start)/duration,1);
        setCount(Math.round(p*p*target));
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },{threshold:.4});
    obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[target,duration]);
  return [count,ref];
}
// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Toast({msg,show}){
  return <div className={`toast ${show?"show":""}`}>{msg}</div>;
}
function StatItem({value,suffix,label,onClick}){
  const [count,ref] = useCountUp(value);
  return(
    <div className="stat-item" ref={ref} onClick={onClick} style={onClick?{cursor:"pointer"}:{}}>
      <div><span className="stat-num">{count.toLocaleString()}</span><span className="stat-suffix">{suffix}</span></div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({onLogin}){
  const [tab,setTab] = useState("client"); // client | team
  const [mode,setMode] = useState("login"); // login | register
  const [form,setForm] = useState({name:"",email:"",password:"",teamId:""});
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(false);
  const [serverOk,setServerOk] = useState(true);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  useEffect(()=>{
    api.health().then(()=>setServerOk(true)).catch(()=>setServerOk(false));
  }, []);
  const submit = async () => {
    setErr("");
    setLoading(true);
    try {
      if(tab==="team"){
        if(form.teamId !== TEAM_ID){ setErr("Invalid Team ID. Please check and try again."); return; }
        if(!form.name.trim()){ setErr("Please enter your name."); return; }
        const { token, user } = await api.loginTeam({ teamId: form.teamId, name: form.name });
        setToken(token);
        onLogin({ ...user, token });
        return;
      }
      if(!form.email || !form.password){ setErr("Email and password are required."); return; }
      if(mode==="register" && !form.name){ setErr("Name is required."); return; }
      const { token, user } = await api.loginClient({ mode, name: form.name, email: form.email, password: form.password });
      setToken(token);
      onLogin({ ...user, token });
    } catch (e) {
      setErr(e.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  const googleLogin = () => {
    setErr("Google sign-in is not connected yet. Please use email and password.");
  };
  return(
    <div className="login-page">
      <div className="login-card">
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={LOGO_URL} alt="Real Media" style={{width:64,height:64,margin:"0 auto 14px",filter:"drop-shadow(0 0 18px rgba(229,57,53,.5))"}}/>
          <div className="bn" style={{fontSize:"1.8rem",letterSpacing:".2em"}}>
            <span style={{color:"var(--red)"}}>REAL</span> MEDIA
          </div>
          <div style={{color:"var(--muted)",fontSize:".84rem",marginTop:6}}>Welcome back. Sign in to continue.</div>
        </div>
        {/* Client / Team tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab==="client"?"active":""}`} onClick={()=>{setTab("client");setErr("")}}>Client</button>
          <button className={`login-tab ${tab==="team"?"active":""}`} onClick={()=>{setTab("team");setErr("")}}>Team Member</button>
        </div>
        {tab==="client"&&(
          <>
            <button className="google-btn" onClick={googleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>
            <div className="divider">or</div>
            {/* Register / Login toggle */}
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"8px",borderRadius:10,border:"1px solid",borderColor:mode===m?"rgba(229,57,53,.5)":"var(--line2)",background:mode===m?"rgba(229,57,53,.1)":"transparent",color:mode===m?"#fff":"var(--muted2)",fontSize:".84rem",transition:"all .2s",textTransform:"capitalize"}}>
                  {m==="login"?"Sign In":"Register"}
                </button>
              ))}
            </div>
            {mode==="register"&&(
              <div className="field"><label>Full Name *</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="Your name"/></div>
            )}
            <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={e=>up("email",e.target.value)} placeholder="you@example.com"/></div>
            <div className="field"><label>Password *</label><input type="password" value={form.password} onChange={e=>up("password",e.target.value)} placeholder="••••••••"/></div>
          </>
        )}
        {tab==="team"&&(
          <>
            <div className="field"><label>Your Name *</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="Team member name"/></div>
            <div className="field"><label>Team Access ID *</label><input type="password" value={form.teamId} onChange={e=>up("teamId",e.target.value)} placeholder="Enter your 10-digit team ID"/></div>
            <div style={{color:"var(--muted)",fontSize:".8rem",marginTop:-8,marginBottom:16}}>Contact your admin for your unique team access ID.</div>
          </>
        )}
        {err&&<div style={{background:"rgba(229,57,53,.12)",border:"1px solid rgba(229,57,53,.35)",borderRadius:12,padding:"10px 14px",fontSize:".86rem",color:"#fca5a5",marginBottom:14}}>{err}</div>}
        {!serverOk&&(
          <div style={{background:"rgba(234,179,8,.1)",border:"1px solid rgba(234,179,8,.35)",borderRadius:12,padding:"10px 14px",fontSize:".84rem",color:"#fde68a",marginBottom:14,lineHeight:1.6}}>
            Backend is not running. In your project folder run: <strong>npm run dev:full</strong>
          </div>
        )}
        <button className="btn-primary" style={{width:"100%"}} onClick={submit} disabled={loading}>
          {loading?"Please wait...":tab==="team"?"Access Team Workspace":mode==="register"?"Create Account":"Sign In"}
        </button>
        {tab==="client"&&(
          <div style={{textAlign:"center",marginTop:14,color:"var(--muted)",fontSize:".82rem"}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>setMode(m=>m==="login"?"register":"login")} style={{color:"var(--red)",background:"none",border:"none",cursor:"pointer",fontSize:".82rem"}}>
              {mode==="login"?"Register here":"Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── HERO ──────────────────────────────────────────────────────────────────────
function Hero({onStartProject}){
  return(
    <section className="hero">
      <div className="hero-inner">
        <div>
          <span className="hero-label">DIGITAL GROWTH AGENCY</span>
          <h1 className="hero-title">
            WE BUILD<br/>
            <span className="red-w" data-text="BRANDS">BRANDS</span><br/>
            THAT GO GLOBAL.
          </h1>
          <p className="hero-copy">
            RealMedia is a full-service digital agency helping Indian businesses build international-level brands through video editing, development, and strategy.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onStartProject}>Start Your Project</button>
          </div>
          <div className="trust-strip">
            {["50+ Projects Delivered","4.9★ Client Rating","Dedicated Handler","Revision Guarantee"].map(t=>(
              <div className="trust-item" key={t}>
                <div className="trust-icon">✓</div>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-num">50+</div><div className="hero-stat-label">Projects</div></div>
            <div className="hero-stat"><div className="hero-stat-num">₹2Cr+</div><div className="hero-stat-label">Revenue Generated</div></div>
            <div className="hero-stat"><div className="hero-stat-num">98%</div><div className="hero-stat-label">Client Retention</div></div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-head">
            <img src={LOGO_URL} alt="Real Media"/>
            <div>
              <div className="bn" style={{fontSize:"1.6rem",letterSpacing:".16em"}}>REALMEDIA</div>
              <div style={{color:"var(--muted)",fontSize:".84rem",marginTop:4}}>Building Brands. Growing Global.</div>
            </div>
          </div>
          {[
            ["🎬 Creative Production","Cinematic shoots, premium editing, and social media content."],
            ["💻 Development","Websites, apps, software, and scalable digital products."],
            ["📈 Marketing & Branding","Ads, branding strategy, and online growth systems."],
          ].map(([h,d])=>(
            <div className="fc" key={h}><h4>{h}</h4><p>{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── SERVICES SECTION (landing) ───────────────────────────────────────────────
function ServicesSection({onServiceClick}){
  return(
    <section className="section" id="services">
      <div className="section-inner">
        <div className="section-label">OUR SERVICES</div>
        <h2 className="section-title">Everything Your Business Needs to Grow</h2>
        <p className="section-sub">From video editing to full-stack development, we cover every angle of your digital growth.</p>
        <div className="services-grid">
          {SERVICES.map(s=>(
            <button className="svc-card" key={s.title} onClick={()=>onServiceClick(s)}>
              <div className="svc-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="svc-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── SERVICE DETAIL PAGE ──────────────────────────────────────────────────────
function ServiceDetailPage({service, onBack, onStartProject, portfolioItems=[], isTeam, onAddPortfolio, onDeletePortfolio}){
  const items = portfolioItems.length ? portfolioItems : mergePortfolioForService(service.title, []);
  return(
    <div className="page" style={{paddingTop:81}}>
      {/* Hero */}
      <div className="service-page-hero">
        <div className="section-inner">
          <button className="service-page-back" onClick={onBack}>
            ← Back to Services
          </button>
          <div className="section-label">{service.icon} {service.title.toUpperCase()}</div>
          <h1 className="section-title">{service.title}</h1>
          <p className="section-sub" style={{maxWidth:680}}>{service.desc}</p>
          <div style={{marginTop:28}}>
            <button className="btn-primary" onClick={onStartProject}>Start Your Project →</button>
          </div>
        </div>
      </div>
      {/* Portfolio */}
      <section className="section portfolio-section">
        <div className="section-inner">
          <div className="section-label">PORTFOLIO</div>
          <h2 className="section-title">Our {service.title} Work</h2>
          {isTeam&&(
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button className="btn-primary" style={{padding:"10px 20px",fontSize:".88rem"}} onClick={onAddPortfolio}>+ Add Portfolio</button>
            </div>
          )}
          {items.length === 0 ? (
            <div className="service-portfolio-grid">
              <div className="svc-port-empty">
                <div style={{fontSize:"3rem",marginBottom:16}}>🎬</div>
                <div style={{fontSize:"1.1rem",fontWeight:500,marginBottom:8}}>Portfolio Coming Soon</div>
                <div style={{fontSize:".88rem",lineHeight:1.7}}>We're currently working on amazing {service.title} projects.<br/>Check back soon or start your project with us today.</div>
                <button className="btn-primary" style={{marginTop:24}} onClick={onStartProject}>Start Your Project</button>
              </div>
            </div>
          ) : (
            <div className="service-portfolio-grid">
              {items.map(item=>(
                <VideoPortfolioCard
                  key={item.id}
                  item={item}
                  onStartProject={onStartProject}
                  isTeam={isTeam}
                  onDelete={isDeletablePortfolioItem(item) ? onDeletePortfolio : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
function VideoPortfolioCard({item, onStartProject, onDelete, isTeam}){
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);
  const src = item.fileUrl || (item.file ? `/src/assets/${item.file}` : mediaUrl(item.mediaUrl));
  const isVideo = item.file || item.fileUrl || item.mediaType === "video" || (item.mediaUrl && /\.(mp4|webm|mov)/i.test(item.mediaUrl));
  const desc = item.desc || item.description || "";
  return(
    <>
      <div className="port-card">
        <div className="port-media" style={{height:240,cursor:isVideo?"pointer":"default"}} 
             onClick={isVideo?()=>setModalOpen(true):undefined}
             onMouseEnter={()=>setHovered(true)}
             onMouseLeave={()=>setHovered(false)}
        >
          {isVideo ? (
          <video
            ref={videoRef}
            src={src}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
            loop
            playsInline
            autoPlay
            muted
          />
          ) : src ? (
            <img src={src} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          ) : (
            <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem",background:"linear-gradient(135deg,rgba(229,57,53,.15),rgba(0,0,0,.8))"}}>🎬</div>
          )}
          {isVideo && (
            <div className="port-play-btn">⤢</div>
          )}
          <div className="port-tag">{item.service}</div>
        </div>
        <div className="port-body">
          <div className="port-client">{item.client}</div>
          <h3>{item.title}</h3>
          <p>{desc}</p>
          <div className="port-results">
            <span className="port-result">{item.outcome}</span>
          </div>
          {isTeam && onDelete ? (
            <button className="btn-ghost" style={{width:"100%",marginTop:14,fontSize:".86rem",padding:"11px 16px"}} onClick={()=>onDelete(item.id)}>Delete Portfolio</button>
          ) : !isTeam ? (
            <button className="btn-primary" style={{width:"100%",marginTop:14,fontSize:".86rem",padding:"11px 16px"}} onClick={onStartProject}>
              Start Your Project
            </button>
          ) : null}
        </div>
      </div>
      {modalOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:99999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setModalOpen(false)}>
          <div style={{position:"absolute",top:20,right:20,display:"flex",gap:16,zIndex:100000}}>
            <a href={src} download onClick={(e)=>e.stopPropagation()} className="btn-primary" style={{textDecoration:"none",display:"flex",alignItems:"center",padding:"8px 16px",fontSize:".9rem"}}>📥 Download</a>
            <button onClick={(e)=>{e.stopPropagation();setModalOpen(false)}} style={{background:"transparent",border:"none",color:"#fff",fontSize:"2rem",cursor:"pointer",padding:"0 10px"}}>✕</button>
          </div>
          <div style={{maxWidth:"100%",maxHeight:"80vh",width:"100%",display:"flex",justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
            <video
              src={src}
              style={{maxWidth:"100%",maxHeight:"80vh",borderRadius:8,outline:"none"}}
              controls
              autoPlay
            />
          </div>
          <div style={{marginTop:20,textAlign:"center",maxWidth:800}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:"1.5rem",marginBottom:8,color:"#fff"}}>{item.title}</h3>
            <p style={{color:"rgba(255,255,255,0.7)",fontSize:"1rem",lineHeight:1.6}}>{desc}</p>
            {item.client && <div style={{color:"rgba(255,255,255,0.5)",marginTop:8,fontSize:".9rem"}}>Client: {item.client}</div>}
          </div>
        </div>
      )}
    </>
  );
}
// ─── PROCESS SECTION ──────────────────────────────────────────────────────────
function ProcessSection(){
  return(
    <section className="section process-section" id="process">
      <div className="section-inner">
        <div className="section-label">HOW WE WORK</div>
        <h2 className="section-title">Our Process</h2>
        <p className="section-sub">A structured, transparent process that keeps you informed from brief to final delivery.</p>
        <div className="process-steps">
          {PROCESS_STEPS.map(s=>(
            <div className="process-step" key={s.num}>
              <div className="ps-num">{s.num}</div>
              <h4 className="ps-title">{s.title}</h4>
              <p className="ps-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── WHY US ───────────────────────────────────────────────────────────────────
function WhyUsSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">WHY CHOOSE US</div>
        <h2 className="section-title">Why Global Brands Choose Real Media</h2>
        <div className="why-grid">
          {WHY_US.map(w=>(
            <div className="why-card" key={w.title}>
              <div className="why-card-head">
                <div className="why-icon">{w.icon}</div>
                <div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── INDUSTRIES ───────────────────────────────────────────────────────────────
function IndustriesSection(){
  return(
    <section className="section industries-section">
      <div className="section-inner">
        <div className="section-label">INDUSTRIES</div>
        <h2 className="section-title">Industries We Work With</h2>
        <p className="section-sub">We've delivered results across a wide range of industries and business types.</p>
        <div className="industries-grid">
          {INDUSTRIES.map(i=>(
            <div className="ind-card" key={i.title}>
              <span className="ind-emoji">{i.emoji}</span>
              <h4>{i.title}</h4>
              <p>{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── PRICING SECTION ──────────────────────────────────────────────────────────
function PricingSection({onStartProject}){
  const [activeTab,setActiveTab] = useState("Video Editing");
  const plans = PRICING_DATA[activeTab]||[];
  return(
    <section className="section pricing-section" id="pricing">
      <div className="section-inner">
        <div className="section-label">PRICING</div>
        <h2 className="section-title">Transparent Pricing in Indian Rupees</h2>
        <p className="section-sub">No hidden fees, no surprises. Choose a plan that fits your goals and budget.</p>
        <div className="pricing-tabs">
          {PRICING_CATEGORIES.map(c=>(
            <button key={c} className={`ptab ${activeTab===c?"active":""}`} onClick={()=>setActiveTab(c)}>{c}</button>
          ))}
        </div>
        <div className="pricing-grid">
          {plans.map(p=>(
            <div key={p.name} className={`pricing-card ${p.badge?"featured":""}`}>
              {p.badge&&<div className="pricing-badge">{p.badge}</div>}
              <div className="pricing-plan">{p.plan}</div>
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-desc">{p.desc}</div>
              <div className="pricing-price">
                <div className="pricing-amount">
                  <span>₹</span>{p.price.replace("₹","")}
                  <span className="pricing-period">{p.period}</span>
                </div>
                {p.starting&&<div className="pricing-starting">Starting from</div>}
              </div>
              <ul className="pricing-features">
                {p.features.map(f=><li key={f}>{f}</li>)}
              </ul>
              <button className={`pricing-cta ${p.badge?"primary":"secondary"}`} onClick={onStartProject}>{p.cta}</button>
              {p.best&&<p className="pricing-best">Best for: {p.best}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── PORTFOLIO SECTION (landing) ──────────────────────────────────────────────
function PortfolioSection({onStartProject, portfolioItems=[], isTeam, onAddPortfolio, onDeletePortfolio, standalone=false}){
  const items = portfolioItems.length ? portfolioItems : (standalone ? VIDEO_ASSETS : VIDEO_ASSETS.slice(0,3));
  return(
    <section className="section portfolio-section" id={standalone?undefined:"portfolio"}>
      <div className="section-inner">
        <div className="section-label">PORTFOLIO</div>
        <h2 className="section-title">Our Video Work</h2>
        <p className="section-sub">A selection of real projects — cinematic edits, music videos, and brand content.</p>
        {isTeam&&(
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
            <button className="btn-primary" style={{padding:"10px 20px",fontSize:".88rem"}} onClick={onAddPortfolio}>+ Add Portfolio</button>
          </div>
        )}
        <div className="portfolio-grid">
          {items.map(item=>(
            <VideoPortfolioCard
              key={item.id}
              item={item}
              onStartProject={onStartProject}
              isTeam={isTeam}
              onDelete={isDeletablePortfolioItem(item) ? onDeletePortfolio : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── ESTIMATOR ────────────────────────────────────────────────────────────────
function EstimatorSection(){
  const [sel,setSel] = useState({service:"",complexity:"Standard",features:[],timeline:"Standard (4-6 weeks)"});
  const toggle=(k,v)=>{
    if(k==="features"){
      setSel(s=>({...s,features:s.features.includes(v)?s.features.filter(f=>f!==v):[...s.features,v]}));
    } else {
      setSel(s=>({...s,[k]:v}));
    }
  };
  const estimate = useMemo(()=>{
    if(!sel.service) return null;
    const base = ESTIMATE_MAP[sel.service]||{min:50000,max:200000,time:"8 weeks"};
    const cm = COMPLEXITY_MULT[sel.complexity]||1;
    const tm = TIMELINE_MULT[sel.timeline]||1;
    const fm = 1 + sel.features.length * 0.08;
    return { min:Math.round(base.min*cm*fm*tm/1000)*1000, max:Math.round(base.max*cm*fm*tm/1000)*1000, time:base.time };
  },[sel]);
  return(
    <section className="section estimator-section">
      <div className="section-inner">
        <div className="section-label">PROJECT ESTIMATOR</div>
        <h2 className="section-title">Get an Instant Budget Estimate</h2>
        <p className="section-sub">Select your project details and get an instant price range.</p>
        <div className="estimator-wrap">
          <div className="estimator-card">
            {[
              {key:"service",label:"1. What service do you need?",opts:ESTIMATOR_CONFIG.service},
              {key:"complexity",label:"2. Project complexity",opts:ESTIMATOR_CONFIG.complexity},
              {key:"timeline",label:"4. Preferred timeline",opts:ESTIMATOR_CONFIG.timeline},
            ].map(g=>(
              <div className="est-step" key={g.key}>
                <div className="est-step-label">{g.label}</div>
                <div className="est-options">
                  {g.opts.map(o=>(
                    <button key={o} className={`est-opt ${sel[g.key]===o?"sel":""}`} onClick={()=>toggle(g.key,o)}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="est-step">
              <div className="est-step-label">3. Features required</div>
              <div className="est-options">
                {ESTIMATOR_CONFIG.features.map(f=>(
                  <button key={f} className={`est-opt ${sel.features.includes(f)?"sel":""}`} onClick={()=>toggle("features",f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="estimate-result">
            <div style={{color:"var(--muted)",fontSize:".8rem",letterSpacing:".12em",textTransform:"uppercase"}}>Estimated Budget Range</div>
            {estimate?(
              <>
                <div className="est-range">{formatIndian(estimate.min)} – {formatIndian(estimate.max)}</div>
                <div className="est-timeline"><span>⏱</span><span>Estimated delivery: <strong>{estimate.time}</strong></span></div>
                <div className="est-breakdown">
                  <div className="est-row"><span>Service</span><span>{sel.service}</span></div>
                  <div className="est-row"><span>Complexity</span><span>{sel.complexity}</span></div>
                  <div className="est-row"><span>Features</span><span>{sel.features.length} selected</span></div>
                  <div className="est-row"><span>Timeline</span><span>{sel.timeline}</span></div>
                </div>
              </>
            ):(
              <div style={{color:"var(--muted)",marginTop:16,fontSize:".9rem"}}>Select a service above to see your estimate.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
// ─── TESTIMONIALS (with user-submitted) ───────────────────────────────────────
function TestimonialsSection({testimonials=[], onAddFeedback, user}){
  const all = [...TESTIMONIALS_STATIC, ...testimonials];
  return(
    <section className="section testimonials-section" id="testimonials">
      <div className="section-inner">
        <div className="section-label">CLIENT TESTIMONIALS</div>
        <h2 className="section-title">What Our Clients Say</h2>
        <p className="section-sub">Real feedback from real clients who trusted us to grow their business.</p>
        {user?.role==="client"&&(
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
            <button className="btn-primary" style={{padding:"10px 20px",fontSize:".88rem"}} onClick={onAddFeedback}>+ Add Your Feedback</button>
          </div>
        )}
        <div className="testimonials-grid">
          {all.map((t,i)=>(
            <div className="testi-card" key={t.id||i}>
              <div className="testi-stars">{"★★★★★".split("").map((s,j)=><span key={j}>{s}</span>)}</div>
              <p className="testi-quote">"{t.quote}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials||t.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                <div><div className="testi-name">{t.name}</div><div className="testi-biz">{t.biz}</div></div>
              </div>
              <div className="testi-tag">
                <span className="testi-pill">{t.tag}</span>
                <span className="testi-pill">{t.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── MULTI-STEP FORM ──────────────────────────────────────────────────────────
function MultiStepForm({onClose,onToast,user,onProjectCreated,prefillPlan}){
  const [step,setStep] = useState(0);
  const TOTAL=4;
  
  let initialService = "";
  if (prefillPlan) {
    if (prefillPlan.name.includes("Edit") || prefillPlan.name.includes("Ad")) initialService = "Video Editing";
    else if (prefillPlan.name.includes("Website") || prefillPlan.name.includes("Store")) initialService = "Web Dev";
    else if (prefillPlan.name.includes("App")) initialService = "App Dev";
    else if (prefillPlan.name.includes("Game")) initialService = "Game Dev";
    else if (prefillPlan.name.includes("Growth") || prefillPlan.name.includes("Domination")) initialService = "Marketing";
  }
  const [data,setData] = useState({service:initialService,budget:prefillPlan?prefillPlan.price:"",timeline:"",name:user?.name||"",email:user?.email||"",phone:"",title:"",description:"",files:[]});
  const [submitting,setSubmitting] = useState(false);
  const up=(k,v)=>setData(d=>({...d,[k]:v}));
  const BUDGET_OPTS=["Under ₹25,000","₹25,000 – ₹1L","₹1L – ₹5L","₹5L – ₹15L","₹15L+","Not sure yet"];
  const TL_OPTS=["ASAP (Rush)","2-4 weeks","1-3 months","3-6 months","Flexible"];
  const submit=async()=>{
    if(!data.name||!data.email) return onToast("Please fill your name and email.");
    if(!data.service||!data.title||!data.description) return onToast("Please complete service, title, and description.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("service", SERVICE_MAP[data.service] || data.service || "Custom");
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("answers", JSON.stringify({ budget: data.budget, timeline: data.timeline, phone: data.phone }));
      
      if (prefillPlan) {
        const fullAmount = parseInt(prefillPlan.price.replace(/[^\d]/g, '')) || 0;
        formData.append("servicePlan", prefillPlan.name);
        formData.append("totalAmount", fullAmount);
      }
      
      data.files.forEach((file)=> formData.append("files", file));
      const { project } = await api.createProject(formData);
      onProjectCreated?.(project);
      onToast(`Project submitted! Your unique project ID is ${project.id}`);
      onClose();
    } catch (e) {
      onToast(e.message || "Could not submit project.");
    } finally {
      setSubmitting(false);
    }
  };
  return(
    <div className="msf-backdrop">
      <div className="msf-modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <h2 className="bn" style={{fontSize:"2rem",letterSpacing:".04em"}}>Start Your Project</h2>
            <p style={{color:"var(--muted)",fontSize:".86rem",marginTop:4}}>Step {step+1} of {TOTAL}</p>
          </div>
          <button onClick={onClose} style={{border:"1px solid var(--line2)",borderRadius:"50%",width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div className="msf-step-label">
          {["Service","Budget & Timeline","Project Details","Your Info"].map((l,i)=>(
            <span key={l} style={{color:i<=step?"rgba(255,255,255,.7)":"var(--muted)"}}>{l}</span>
          ))}
        </div>
        <div className="msf-progress">
          {Array.from({length:TOTAL}).map((_,i)=>(
            <div key={i} className={`msf-step-dot ${i<step?"done":i===step?"active":""}`}/>
          ))}
        </div>
        {step===0&&(
          <div>
            <p style={{color:"var(--muted)",marginBottom:20,fontSize:".92rem"}}>What service are you looking for?</p>
            <div className="svc-select">
              {[["🎬","Video Editing"],["🌐","Web Dev"],["📱","App Dev"],["🎮","Game Dev"],["📈","Marketing"]].map(([ic,lb])=>(
                <button key={lb} className={`svc-sel-btn ${data.service===lb?"sel":""}`} onClick={()=>up("service",lb)}>
                  <span className="svc-sel-icon">{ic}</span>{lb}
                </button>
              ))}
            </div>
          </div>
        )}
        {step===1&&(
          <div>
            <p style={{color:"var(--muted)",marginBottom:14,fontSize:".92rem"}}>What's your approximate budget?</p>
            <div className="budget-opts">
              {BUDGET_OPTS.map(b=>(
                <button key={b} className={`budget-opt ${data.budget===b?"sel":""}`} onClick={()=>up("budget",b)}>{b}</button>
              ))}
            </div>
            <p style={{color:"var(--muted)",marginTop:20,marginBottom:14,fontSize:".92rem"}}>Preferred timeline?</p>
            <div className="est-options">
              {TL_OPTS.map(t=>(
                <button key={t} className={`est-opt ${data.timeline===t?"sel":""}`} onClick={()=>up("timeline",t)}>{t}</button>
              ))}
            </div>
          </div>
        )}
        {step===2&&(
          <div>
            <div className="field"><label>Project Title</label><input value={data.title} onChange={e=>up("title",e.target.value)} placeholder="e.g. Cinematic reel for brand campaign"/></div>
            <div className="field"><label>Project Description</label><textarea style={{minHeight:120}} value={data.description} onChange={e=>up("description",e.target.value)} placeholder="Describe your goals, target audience, style preferences..."/></div>
            <div className="field"><label>Upload Reference Files (optional)</label><input type="file" multiple onChange={e=>up("files",Array.from(e.target.files))}/><span style={{color:"var(--muted)",fontSize:".8rem",marginTop:4,display:"block"}}>Videos, images, logos, PDFs</span></div>
          </div>
        )}
        {step===3&&(
          <div>
            <div className="msf-grid">
              <div className="field"><label>Full Name *</label><input value={data.name} onChange={e=>up("name",e.target.value)} placeholder="Your name"/></div>
              <div className="field"><label>Email *</label><input type="email" value={data.email} onChange={e=>up("email",e.target.value)} placeholder="you@example.com"/></div>
            </div>
            <div className="field"><label>Phone</label><input value={data.phone} onChange={e=>up("phone",e.target.value)} placeholder="+91 98765 43210"/></div>
            <div style={{background:"rgba(229,57,53,.07)",border:"1px solid rgba(229,57,53,.22)",borderRadius:14,padding:"14px 16px",marginTop:8}}>
              <div style={{fontWeight:500,marginBottom:8,fontSize:".9rem"}}>Project Summary</div>
              <div style={{color:"var(--muted)",fontSize:".84rem",lineHeight:1.7}}>
                Service: {data.service||"Not specified"}<br/>
                Budget: {data.budget||"Not specified"}<br/>
                Timeline: {data.timeline||"Not specified"}<br/>
                Files: {data.files.length} attached
              </div>
            </div>
          </div>
        )}
        <div className="msf-nav">
          {step>0?<button className="btn-ghost" onClick={()=>setStep(s=>s-1)}>← Back</button>:<div/>}
          {step<TOTAL-1?(
            <button className="btn-primary" onClick={()=>setStep(s=>s+1)}>Continue →</button>
          ):(
            <button className="btn-primary" onClick={submit} disabled={submitting}>{submitting?"Submitting...":"Submit Brief ✓"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── FEEDBACK FORM ────────────────────────────────────────────────────────────
function FeedbackForm({onSubmit, onClose, user}){
  const [step, setStep] = useState(0);
  const [verifiedProject, setVerifiedProject] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({name:user?.name||"",biz:"",quote:"",result:"",tag:"Video Editing"});
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const verifyProject = async () => {
    setErr("");
    if(!projectTitle.trim()){ setErr("Enter your project name."); return; }
    setLoading(true);
    try {
      const { project } = await api.verifyProjectForFeedback(projectTitle.trim());
      setVerifiedProject(project);
      setForm(f=>({...f, tag: project.service || f.tag}));
      setStep(1);
    } catch (e) {
      setErr(e.message || "Project not found.");
    } finally {
      setLoading(false);
    }
  };
  const submit = async () => {
    if(!form.name||!form.quote) return;
    setLoading(true);
    try {
      const { testimonial } = await api.submitTestimonial({
        projectTitle: verifiedProject?.title || projectTitle.trim(),
        name: form.name,
        biz: form.biz,
        quote: form.quote,
        tag: form.tag,
        result: form.result,
      });
      onSubmit(testimonial);
      onClose();
    } catch (e) {
      setErr(e.message || "Could not submit feedback.");
    } finally {
      setLoading(false);
    }
  };
  return(
    <div className="msf-backdrop">
      <div className="msf-modal" style={{maxWidth:500}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 className="bn" style={{fontSize:"1.8rem"}}>Share Your Feedback</h2>
          <button onClick={onClose} style={{border:"1px solid var(--line2)",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {step===0 ? (
          <>
            <p style={{color:"var(--muted)",marginBottom:16,fontSize:".88rem",lineHeight:1.65}}>Enter the exact project name from your workspace. Feedback is only accepted for matching projects.</p>
            <div className="field"><label>Project Name *</label><input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} placeholder="Exact project title"/></div>
            {err&&<div style={{background:"rgba(229,57,53,.12)",border:"1px solid rgba(229,57,53,.35)",borderRadius:12,padding:"10px 14px",fontSize:".86rem",color:"#fca5a5",marginBottom:14}}>{err}</div>}
            <button className="btn-primary" style={{width:"100%"}} onClick={verifyProject} disabled={loading}>{loading?"Checking...":"Verify Project →"}</button>
          </>
        ) : (
          <>
            <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",borderRadius:12,padding:"10px 14px",fontSize:".84rem",color:"#86efac",marginBottom:16}}>
              Project matched: <strong>{verifiedProject?.title}</strong> (ID: {verifiedProject?.id})
            </div>
            <div className="field"><label>Your Name *</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="Full name"/></div>
        <div className="field"><label>Business / Role</label><input value={form.biz} onChange={e=>up("biz",e.target.value)} placeholder="e.g. Gym Owner, Mumbai"/></div>
        <div className="field"><label>Service Used</label>
          <select value={form.tag} onChange={e=>up("tag",e.target.value)}>
            {["Video Editing","Web Development","App Development","Game Development","Marketing"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Your Feedback *</label><textarea style={{minHeight:100}} value={form.quote} onChange={e=>up("quote",e.target.value)} placeholder="Share your experience with Real Media..."/></div>
        <div className="field"><label>Key Result</label><input value={form.result} onChange={e=>up("result",e.target.value)} placeholder="e.g. 2x Leads, 180% Sales"/></div>
            {err&&<div style={{background:"rgba(229,57,53,.12)",border:"1px solid rgba(229,57,53,.35)",borderRadius:12,padding:"10px 14px",fontSize:".86rem",color:"#fca5a5",marginBottom:14}}>{err}</div>}
            <button className="btn-primary" style={{width:"100%",marginTop:4}} onClick={submit} disabled={loading}>{loading?"Submitting...":"Submit Feedback ✓"}</button>
          </>
        )}
      </div>
    </div>
  );
}
// ─── PAYMENT GATE ────────────────────────────────────────────────────────────
function PaymentGate({ project, onPaymentComplete, onToast }) {
  const [loading, setLoading] = useState(false);
  const upfrontRequired = project.totalAmount; 
  let amountToPay = 0;
  if (project.paymentStatus === 'half_paid') {
    amountToPay = project.totalAmount - project.amountPaid;
  } else {
    amountToPay = (project.servicePlan.includes("Edit") || project.servicePlan.includes("Ad") || project.servicePlan === "Custom") ? project.totalAmount : project.totalAmount / 2;
  }
  const handlePay = async () => {
    setLoading(true);
    try {
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      const { key } = await api.getPaymentKey();
      const order = await api.createPaymentOrder({ projectId: project.id, amount: amountToPay });
      
      if (order.id && order.id.startsWith("order_mock_")) {
        onToast("Mock Payment successful! (No Razorpay keys provided)");
        const { project: updated } = await api.verifyPayment({
          projectId: project.id,
          razorpay_payment_id: `mock_${Date.now()}`,
          razorpay_order_id: order.id,
          razorpay_signature: "mock_sig",
          amount: amountToPay
        });
        onPaymentComplete(updated);
        setLoading(false);
        return;
      }
      const options = {
        key: key || "test_key",
        amount: order.amount,
        currency: order.currency,
        name: "Real Media",
        description: `Payment for ${project.title}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const { project: updated } = await api.verifyPayment({
              projectId: project.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountToPay
            });
            onPaymentComplete(updated);
          } catch (e) {
            onToast(e.message || "Payment verification failed.");
          }
        },
        prefill: { name: project.client_name || "Client" },
        theme: { color: "#E53935" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        onToast("Payment failed or cancelled.");
      });
      rzp.open();
    } catch (e) {
      onToast(e.message || "Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",textAlign:"center",background:"rgba(8,8,10,.7)",border:"1px solid var(--line2)",borderRadius:20,height:"100%"}}>
      <div style={{fontSize:"3rem",marginBottom:20}}>💳</div>
      <h2 style={{fontSize:"1.8rem",marginBottom:10,fontWeight:700}}>Payment Required</h2>
      <p style={{color:"var(--muted)",marginBottom:30,maxWidth:400,lineHeight:1.6}}>
        To access your project workspace for <strong>{project.title}</strong>, a payment of ₹{amountToPay.toLocaleString()} is required. 
        {project.paymentStatus === 'pending' && amountToPay < project.totalAmount && " (50% upfront for this plan)."}
      </p>
      <button className="btn-primary" style={{padding:"14px 30px",fontSize:"1.1rem"}} onClick={handlePay} disabled={loading}>
        {loading ? "Processing..." : `Pay ₹${amountToPay.toLocaleString()} Securely`}
      </button>
    </div>
  );
}
// ─── CLIENT WORKSPACE ─────────────────────────────────────────────────────────
function ClientWorkspace({user, onToast, onShowFeedback, onStartProject}){
  const [activeNav,setActiveNav] = useState("projects");
  const [projects,setProjects] = useState([]);
  const [selProj,setSelProj] = useState(null);
  const [msg,setMsg] = useState("");
  const [notifications,setNotifications] = useState([]);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadProjects = useCallback(async ()=>{
    try {
      const { projects: list } = await api.getProjects();
      setProjects(list);
      setSelProj(prev => list.find(p=>p.id===prev?.id) || list[0] || null);
    } catch (e) {
      onToast(e.message || "Could not load projects.");
    }
  }, [onToast]);
  const loadNotifications = useCallback(async ()=>{
    try {
      const { notifications: list } = await api.getNotifications();
      setNotifications(list);
    } catch {}
  }, []);
  useEffect(()=>{ loadProjects(); loadNotifications(); }, [loadProjects, loadNotifications]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[selProj?.messages]);
  const send=async()=>{
    if(!msg.trim()||!selProj) return;
    try {
      const { project } = await api.sendMessage(selProj.id, msg.trim());
      setSelProj(project);
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      setMsg("");
      loadNotifications();
    } catch (e) {
      onToast(e.message || "Could not send message.");
    }
  };
  const uploadFiles = async (e) => {
    if(!selProj || !e.target.files?.length) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach(f=>formData.append("files", f));
    try {
      const { project } = await api.uploadFiles(selProj.id, formData);
      setSelProj(project);
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      onToast("Files uploaded.");
      loadNotifications();
    } catch (err) {
      onToast(err.message || "Upload failed.");
    }
    e.target.value = "";
  };
  const unreadCount = notifications.filter(n=>!n.read).length;
  const allFiles = projects.flatMap(p=>p.files||[]);
  return(
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={LOGO_URL} alt="RM"/>
          <div><div className="bn" style={{fontSize:"1.1rem",letterSpacing:".2em"}}>REALMEDIA</div><div style={{color:"var(--muted)",fontSize:".76rem"}}>Client Workspace</div></div>
        </div>
        <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".08em",marginBottom:8,padding:"0 14px"}}>Welcome, {user?.name}</div>
        <div className="sidebar-nav">
          {[
            {id:"projects",icon:"📁",label:"My Projects",badge:projects.length},
            {id:"notifications",icon:"🔔",label:"Notifications",badge:unreadCount||null},
            {id:"files",icon:"📎",label:"Files"},
            {id:"feedback",icon:"⭐",label:"Give Feedback"},
          ].map(n=>(
            <button key={n.id} className={`snav-btn ${activeNav===n.id?"active":""}`} onClick={()=>setActiveNav(n.id)}>
              <span className="snav-icon">{n.icon}</span>
              {n.label}
              {n.badge&&<span className="snav-badge">{n.badge}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className="workspace-content">
        <div className="ws-header">
          <div className="ws-title">{activeNav==="projects"?"Your Projects":activeNav==="notifications"?"Notifications":activeNav==="files"?"Project Files":"Feedback"}</div>
          {activeNav==="projects"&&<button className="btn-primary" style={{padding:"10px 20px",fontSize:".88rem"}} onClick={onStartProject}>+ New Project</button>}
        </div>
        {activeNav==="projects"&&(
          <div className="ws-grid">
            <div className="proj-list-panel">
              <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Active Projects</div>
              {projects.length===0 ? (
                <div style={{color:"var(--muted)",fontSize:".88rem",padding:"24px 0",textAlign:"center"}}>No projects yet. Start your first project from the home page.</div>
              ) : projects.map(p=>(
                <button key={p.id} className={`proj-item ${selProj?.id===p.id?"active":""}`} onClick={()=>setSelProj(p)}>
                  <h4>{p.title}</h4>
                  <p>{p.service}</p>
                  <div style={{color:"var(--muted)",fontSize:".72rem",marginTop:4}}>ID: {p.id}</div>
                  <span className="proj-status status-active">{p.status}</span>
                </button>
              ))}
              {selProj&&(
                <>
                  <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".1em",textTransform:"uppercase",margin:"20px 0 12px"}}>Project Status</div>
                  <div className="ws-timeline">
                    <div style={{color:"var(--muted2)",fontSize:".88rem",lineHeight:1.6}}>{selProj.status}</div>
                  </div>
                </>
              )}
            </div>
            <div className="chat-panel">
              {selProj?.paymentStatus === 'pending' ? (
                <PaymentGate project={selProj} onPaymentComplete={p => { setSelProj(p); setProjects(prev=>prev.map(x=>x.id===p.id?p:x)); }} onToast={onToast} />
              ) : (
                <>
                  <div className="chat-head">
                    <div>
                      <div style={{fontWeight:600,marginBottom:4}}>{selProj?.title}</div>
                      <div style={{color:"var(--muted)",fontSize:".8rem"}}>{selProj?.service} · {selProj?.status} · ID: {selProj?.id}</div>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      {selProj?.projectState === 'active' && <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px",color:"#fca5a5"}} onClick={async () => {
                        if(!confirm("Are you sure you want to stop this project? You will be removed from the chat and files will be deleted. You can then request a refund.")) return;
                        try {
                          const { project } = await api.stopProject(selProj.id);
                          setSelProj(project);
                          setProjects(prev=>prev.map(x=>x.id===project.id?project:x));
                          onToast("Project stopped. Please contact support for your refund.");
                        } catch(e) { onToast(e.message); }
                      }}>Stop & Refund</button>}
                      <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px"}} onClick={()=>fileInputRef.current?.click()} disabled={selProj?.projectState !== 'active'}>Upload Files</button>
                    </div>
                    <input ref={fileInputRef} type="file" multiple style={{display:"none"}} onChange={uploadFiles}/>
                  </div>
                  <div className="chat-body">
                    {(selProj?.messages||[]).map(m=>(
                      <div key={m.id} className={`bubble ${m.senderRole}`}>
                        {m.senderRole!=="client"&&<small>{m.senderName||"System"}</small>}
                        {m.text}
                      </div>
                    ))}
                    <div ref={bottomRef}/>
                  </div>
                  <div className="composer">
                    <input value={msg} disabled={selProj?.projectState !== 'active'} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={selProj?.projectState !== 'active' ? "Project is read-only." : "Message your handler..."}/>
                    <button className="btn-primary" disabled={selProj?.projectState !== 'active'} style={{padding:"11px 20px",fontSize:".88rem"}} onClick={send}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {activeNav==="notifications"&&(
          <div style={{maxWidth:680}}>
            {notifications.length===0 ? (
              <div style={{color:"var(--muted)",padding:"32px 0"}}>No notifications yet.</div>
            ) : notifications.map(n=>(
              <div key={n.id} style={{border:`1px solid ${!n.read?"rgba(229,57,53,.45)":"var(--line)"}`,borderRadius:16,padding:18,marginBottom:12,background:"rgba(8,8,10,.7)"}}>
                <div style={{fontWeight:500,marginBottom:6}}>{n.title}</div>
                <div style={{color:"var(--muted)",fontSize:".88rem",lineHeight:1.65,marginBottom:8}}>{n.message}</div>
                <div style={{color:"var(--muted)",fontSize:".76rem"}}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        {activeNav==="files"&&(
          allFiles.length===0 ? (
          <div style={{color:"var(--muted)",padding:"48px 0",textAlign:"center"}}>
            <div style={{fontSize:"2.5rem",marginBottom:14}}>📁</div>
            <div style={{fontWeight:500,marginBottom:8}}>No files yet</div>
            <div style={{fontSize:".88rem"}}>Files uploaded during your project will appear here.</div>
          </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:680}}>
              {allFiles.map(f=>(
                <a key={f.id} href={mediaUrl(f.url)} target="_blank" rel="noreferrer" style={{border:"1px solid var(--line)",borderRadius:14,padding:14,color:"var(--muted2)"}}>{f.originalName}</a>
              ))}
            </div>
          )
        )}
        {activeNav==="feedback"&&(
          <div style={{maxWidth:600}}>
            <p style={{color:"var(--muted)",marginBottom:24,lineHeight:1.7}}>Enjoyed working with us? Share your feedback and it will appear on our website's testimonials section for other clients to see.</p>
            <div className="feedback-form">
              <div style={{fontSize:"1.8rem",marginBottom:4,textAlign:"center"}}>⭐⭐⭐⭐⭐</div>
              <p style={{color:"var(--muted)",textAlign:"center",marginBottom:20,fontSize:".88rem"}}>Click the button below to write your review</p>
              <button className="btn-primary" style={{width:"100%"}} onClick={onShowFeedback}>Write Your Review →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── TEAM WORKSPACE ───────────────────────────────────────────────────────────
function TeamWorkspace({user, onToast, onPortfolioChange}){
  const [activeNav, setActiveNav] = useState("clients");
  const [category, setCategory] = useState("All");
  const [projects, setProjects] = useState([]);
  const [selClient, setSelClient] = useState(null);
  const [msg, setMsg] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portForm, setPortForm] = useState({title:"",service:"Video Editing",description:"",client:"",outcome:""});
  const [portMedia, setPortMedia] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadFiles = async (e) => {
    if(!selClient || !e.target.files?.length) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach(f=>formData.append("files", f));
    try {
      const { project } = await api.uploadFiles(selClient.id, formData);
      setSelClient(project);
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      onToast("Files uploaded.");
      loadNotifications();
    } catch (err) {
      onToast(err.message || "Upload failed.");
    }
    e.target.value = "";
  };
  const loadProjects = useCallback(async ()=>{
    try {
      const { projects: list } = await api.getProjects();
      setProjects(list);
      setSelClient(prev => list.find(p=>p.id===prev?.id) || list[0] || null);
    } catch (e) {
      onToast(e.message || "Could not load projects.");
    }
  }, [onToast]);
  const loadPortfolio = useCallback(async ()=>{
    try {
      const { portfolio: list } = await api.getPortfolio();
      setPortfolio(list);
    } catch (e) {
      onToast(e.message || "Could not load portfolio.");
    }
  }, [onToast]);
  const loadNotifications = useCallback(async ()=>{
    try {
      const { notifications: list } = await api.getNotifications();
      setNotifications(list);
    } catch {}
  }, []);
  useEffect(()=>{ loadProjects(); loadPortfolio(); loadNotifications(); }, [loadProjects, loadPortfolio, loadNotifications]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[selClient?.messages]);
  const filteredProjects = category==="All" ? projects : projects.filter(p=>p.service===category||p.service.includes(category.replace(" Development","").replace(" Editing","")));
  const send = async () => {
    if(!msg.trim()||!selClient) return;
    try {
      const { project } = await api.sendMessage(selClient.id, msg.trim());
      setSelClient(project);
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      setMsg("");
      loadNotifications();
    } catch (e) {
      onToast(e.message || "Could not send message.");
    }
  };
  const updateStatus = async () => {
    if(!selClient) return;
    const status = window.prompt("Update project status:", selClient.status);
    if(!status?.trim()) return;
    try {
      const { project } = await api.updateStatus(selClient.id, status.trim());
      setSelClient(project);
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      onToast("Status updated.");
      loadNotifications();
    } catch (e) {
      onToast(e.message || "Could not update status.");
    }
  };
  const addPortfolio = async () => {
    if(!portForm.title||!portForm.description) return;
    try {
      const formData = new FormData();
      formData.append("title", portForm.title);
      formData.append("service", portForm.service);
      formData.append("description", portForm.description);
      formData.append("client", portForm.client);
      formData.append("outcome", portForm.outcome);
      if(portMedia) formData.append("media", portMedia);
      await api.addPortfolio(formData);
      setPortForm({title:"",service:"Video Editing",description:"",client:"",outcome:""});
      setPortMedia(null);
      setShowPortForm(false);
      await loadPortfolio();
      onPortfolioChange?.();
      onToast("Portfolio item added!");
    } catch (e) {
      onToast(e.message || "Could not add portfolio.");
    }
  };
  const deletePortfolioItem = async (id) => {
    try {
      await api.deletePortfolio(id);
      await loadPortfolio();
      onPortfolioChange?.();
      onToast("Portfolio item deleted.");
    } catch (e) {
      onToast(e.message || "Could not delete portfolio.");
    }
  };
  const unreadCount = notifications.filter(n=>!n.read).length;
  return(
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={LOGO_URL} alt="RM"/>
          <div><div className="bn" style={{fontSize:"1.1rem",letterSpacing:".2em"}}>REALMEDIA</div><div style={{color:"var(--muted)",fontSize:".76rem"}}>Team Workspace</div></div>
        </div>
        <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".08em",marginBottom:8,padding:"0 14px"}}>
          {user?.name} · Team
        </div>
        <div className="sidebar-nav">
          {[
            {id:"clients",icon:"👥",label:"Client List",badge:projects.length||null},
            {id:"portfolio",icon:"🎬",label:"Portfolio"},
            {id:"notifications",icon:"🔔",label:"Notifications",badge:unreadCount||null},
          ].map(n=>(
            <button key={n.id} className={`snav-btn ${activeNav===n.id?"active":""}`} onClick={()=>setActiveNav(n.id)}>
              <span className="snav-icon">{n.icon}</span>
              {n.label}
              {n.badge&&<span className="snav-badge">{n.badge}</span>}
            </button>
          ))}
        </div>
      </aside>
      <div className="workspace-content">
        <div className="ws-header">
          <div className="ws-title">{activeNav==="clients"?"Client Projects":activeNav==="portfolio"?"Portfolio Manager":"Notifications"}</div>
          {activeNav==="portfolio"&&(
            <button className="btn-primary" style={{padding:"10px 20px",fontSize:".88rem"}} onClick={()=>setShowPortForm(v=>!v)}>
              {showPortForm?"Cancel":"+ Add Portfolio"}
            </button>
          )}
        </div>
        {activeNav==="clients"&&(
          <>
            {/* Category filter */}
            <div className="team-ws-cats">
              {TEAM_CATEGORIES.map(c=>(
                <button key={c} className={`team-cat-btn ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>
              ))}
            </div>
            <div className="ws-grid">
              <div className="proj-list-panel">
                <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>
                  {category==="All"?"All Clients":category+" Clients"}
                </div>
                <div className="client-list">
                  {filteredProjects.map(p=>(
                    <button key={p.id} className={`client-row ${selClient?.id===p.id?"active":""}`} onClick={()=>setSelClient(p)}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div className="client-avatar">{(p.clientName||"C").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontWeight:500,fontSize:".9rem"}}>{p.clientName}</div>
                          <div style={{color:"var(--muted)",fontSize:".78rem"}}>{p.service} · {p.status}</div>
                          <div style={{color:"var(--muted)",fontSize:".72rem"}}>ID: {p.id}</div>
                        </div>
                      </div>
                      <span className="proj-status status-active">{p.status.includes("submitted")?"New":"Active"}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selClient ? (
                <div className="chat-panel">
                  <div className="chat-head" style={{flexDirection:"column",alignItems:"flex-start",gap:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",width:"100%"}}>
                      <div>
                        <div style={{fontWeight:600,marginBottom:4}}>{selClient.clientName}</div>
                        <div style={{color:"var(--muted)",fontSize:".8rem"}}>{selClient.service} · {selClient.title} · ID: {selClient.id}</div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        {selClient?.projectState === 'active' && <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px",color:"#fca5a5"}} onClick={async () => {
                          if(!confirm("Are you sure you want to stop this project? This will delete all client files and stop chat access.")) return;
                          try {
                            const { project } = await api.stopProject(selClient.id);
                            setSelClient(project);
                            setProjects(prev=>prev.map(x=>x.id===project.id?project:x));
                            onToast("Project stopped.");
                          } catch(e) { onToast(e.message); }
                        }}>Stop</button>}
                        {selClient?.projectState === 'active' && <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px",color:"#86efac"}} onClick={async () => {
                          if(!confirm("Are you sure you want to finish this project? This will delete working files and stop chat access.")) return;
                          try {
                            const { project } = await api.finishProject(selClient.id);
                            setSelClient(project);
                            setProjects(prev=>prev.map(x=>x.id===project.id?project:x));
                            onToast("Project finished.");
                          } catch(e) { onToast(e.message); }
                        }}>Finish</button>}
                        <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px"}} onClick={()=>fileInputRef.current?.click()} disabled={selClient?.projectState !== 'active'}>Upload Files</button>
                        <input ref={fileInputRef} type="file" multiple style={{display:"none"}} onChange={uploadFiles}/>
                        <button className="btn-primary" style={{fontSize:".82rem",padding:"8px 14px"}} onClick={updateStatus} disabled={selClient?.projectState !== 'active'}>Update Status</button>
                      </div>
                    </div>
                    {selClient.files?.length > 0 && (
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",width:"100%"}}>
                        {selClient.files.map(f=>(
                          <a key={f.id} href={mediaUrl(f.url)} target="_blank" rel="noreferrer" style={{background:"rgba(255,255,255,0.05)",padding:"4px 10px",borderRadius:6,fontSize:".76rem",color:"var(--muted2)",textDecoration:"none"}} title={f.originalName}>
                            📎 {f.originalName.length > 20 ? f.originalName.slice(0,20)+"..." : f.originalName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="chat-body">
                    {(selClient.messages||[]).map((m)=>(
                      <div key={m.id} className={`bubble ${m.senderRole}`}>
                        {m.senderRole!=="team"&&<small>{m.senderName||"Client"}</small>}
                        {m.senderRole==="team"&&<small>{m.senderName||user?.name}</small>}
                        {m.text}
                      </div>
                    ))}
                    <div ref={bottomRef}/>
                  </div>
                  <div className="composer">
                    <input value={msg} disabled={selClient?.projectState !== 'active'} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={selClient?.projectState !== 'active' ? "Project is read-only." : `Reply to ${selClient.clientName}...`}/>
                    <button className="btn-primary" disabled={selClient?.projectState !== 'active'} style={{padding:"11px 20px",fontSize:".88rem"}} onClick={send}>Send</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--line)",borderRadius:22,color:"var(--muted)",fontSize:".9rem"}}>
                  Select a client to start chatting
                </div>
              )}
            </div>
          </>
        )}
        {activeNav==="portfolio"&&(
          <>
            {showPortForm&&(
              <div className="port-upload-form">
                <h3 className="bn" style={{fontSize:"1.4rem",marginBottom:18}}>Add Portfolio Item</h3>
                <div className="msf-grid">
                  <div className="field"><label>Title *</label><input value={portForm.title} onChange={e=>setPortForm(f=>({...f,title:e.target.value}))} placeholder="Project title"/></div>
                  <div className="field"><label>Service</label>
                    <select value={portForm.service} onChange={e=>setPortForm(f=>({...f,service:e.target.value}))}>
                      {["Video Editing","Web Development","App Development","Game Development","Marketing"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field"><label>Description *</label><textarea value={portForm.description} onChange={e=>setPortForm(f=>({...f,description:e.target.value}))} placeholder="What was the project about?"/></div>
                <div className="msf-grid">
                  <div className="field"><label>Client</label><input value={portForm.client} onChange={e=>setPortForm(f=>({...f,client:e.target.value}))} placeholder="Client name"/></div>
                  <div className="field"><label>Key Outcome</label><input value={portForm.outcome} onChange={e=>setPortForm(f=>({...f,outcome:e.target.value}))} placeholder="e.g. 2x Revenue"/></div>
                </div>
                <div className="field"><label>Upload Media</label>
                  <div className="drop-zone">
                    <div style={{fontSize:"2rem",marginBottom:8}}>📤</div>
                    <div style={{fontSize:".88rem",color:"var(--muted)"}}>Click to upload video or image</div>
                    <input type="file" accept="video/*,image/*" style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}} onChange={e=>setPortMedia(e.target.files?.[0]||null)}/>
                  </div>
                </div>
                <button className="btn-primary" onClick={addPortfolio}>Add to Portfolio ✓</button>
              </div>
            )}
            {mergeAllPortfolio(portfolio).length === 0 && !showPortForm ? (
              <div style={{textAlign:"center",padding:"64px 0",color:"var(--muted)"}}>
                <div style={{fontSize:"3rem",marginBottom:14}}>🎬</div>
                <div style={{fontWeight:500,marginBottom:8}}>No portfolio items yet</div>
                <div style={{fontSize:".88rem",marginBottom:20}}>Add your first portfolio item to showcase your work.</div>
                <button className="btn-primary" onClick={()=>setShowPortForm(true)}>+ Add Portfolio Item</button>
              </div>
            ) : (
              <div className="portfolio-grid">
                {mergeAllPortfolio(portfolio).map(item=>(
                  <VideoPortfolioCard key={item.id} item={item} isTeam onDelete={item.createdAt ? deletePortfolioItem : undefined}/>
                ))}
              </div>
            )}
          </>
        )}
        {activeNav==="notifications"&&(
          <div style={{maxWidth:680}}>
            {notifications.length===0 ? (
              <div style={{color:"var(--muted)",padding:"32px 0"}}>No notifications yet.</div>
            ) : notifications.map(n=>(
              <div key={n.id} style={{border:`1px solid ${!n.read?"rgba(229,57,53,.45)":"var(--line)"}`,borderRadius:16,padding:18,marginBottom:12,background:"rgba(8,8,10,.7)"}}>
                <div style={{fontWeight:500,marginBottom:6}}>{n.title}</div>
                <div style={{color:"var(--muted)",fontSize:".88rem",lineHeight:1.65,marginBottom:8}}>{n.message}</div>
                <div style={{color:"var(--muted)",fontSize:".76rem"}}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── CTA BAND ─────────────────────────────────────────────────────────────────
function CtaBand({onStartProject}){
  return(
    <div className="cta-band">
      <h2 className="bn">Ready to Build Something Great?</h2>
      <p>Join 50+ businesses that chose Real Media to grow their brand digitally.</p>
      <div className="cta-actions">
        <button className="btn-primary" onClick={onStartProject}>Start Your Project</button>
      </div>
    </div>
  );
}
// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({onNav}){
  return(
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="bn" style={{fontSize:"1.8rem",letterSpacing:".2em"}}>
              <span style={{color:"var(--red)"}}>REAL</span> MEDIA
            </div>
            <p>A full-service digital agency helping businesses grow with international-level content, development, and marketing.</p>
          </div>
          {[
            {title:"Services",links:["Video Editing","Web Development","App Development","Game Development","Marketing"]},
            {title:"Company",links:["Portfolio","Process","Pricing","Testimonials"]},
            {title:"Contact",links:["Start a Project","Instagram","WhatsApp","Email Us"]},
          ].map(col=>(
            <div className="footer-col" key={col.title}>
              <h5>{col.title}</h5>
              {col.links.map(l=><a key={l} href="#" onClick={e=>{e.preventDefault();}}>{l}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2026 Real Media. All rights reserved.</p>
          <p style={{color:"var(--muted)",fontSize:".8rem"}}>Built in India · Delivered Globally</p>
        </div>
      </div>
    </footer>
  );
}
// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function RealMediaPlatform(){
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [hasProjects, setHasProjects] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [portForm, setPortForm] = useState({title:"",service:"Video Editing",description:"",client:"",outcome:""});
  const [portMedia, setPortMedia] = useState(null);
  const [toast, setToast] = useState({msg:"",show:false});
  const toastTimer = useRef(null);
  const showToast=(msg)=>{
    clearTimeout(toastTimer.current);
    setToast({msg,show:true});
    toastTimer.current = setTimeout(()=>setToast(t=>({...t,show:false})),3200);
  };
  const loadPortfolio = useCallback(async ()=>{
    try {
      const { portfolio } = await api.getPortfolio();
      setPortfolioItems(portfolio);
    } catch {}
  }, []);
  const loadTestimonials = useCallback(async ()=>{
    try {
      const { testimonials: list } = await api.getTestimonials();
      setTestimonials(list);
    } catch {}
  }, []);
  useEffect(()=>{
    const token = getToken();
    if(!token){ setAuthLoading(false); return; }
    api.me()
      .then(({ user: me })=>setUser(me))
      .catch(()=>setToken(null))
      .finally(()=>setAuthLoading(false));
  }, []);
  const checkProjects = useCallback(async () => {
    if(!user) return;
    if(user.role === "team") { setHasProjects(true); return; }
    try {
      const { projects } = await api.getProjects();
      setHasProjects(projects.length > 0);
    } catch {}
  }, [user]);
  useEffect(()=>{
    if(user){ loadPortfolio(); loadTestimonials(); checkProjects(); }
  }, [user, loadPortfolio, loadTestimonials, checkProjects]);
  const handleLogin = (userData) => {
    setUser(userData);
    setPage("home");
  };
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPage("home");
  };
  const [prefillPlan, setPrefillPlan] = useState(null);
  const handleStartProject = (plan = null) => {
    if(user?.role==="team") return showToast("Clients start projects from this button.");
    if(!user) {
      showToast("Please sign in or create an account to start your project.");
      setPage("login");
      return;
    }
    setPrefillPlan(plan?.name ? plan : null);
    setShowForm(true);
  };
  const handleDeletePortfolio = async (id) => {
    try {
      await api.deletePortfolio(id);
      await loadPortfolio();
      showToast("Portfolio item deleted.");
    } catch (e) {
      showToast(e.message || "Could not delete portfolio.");
    }
  };
  const handleAddPortfolio = async () => {
    if(!portForm.title||!portForm.description) return showToast("Title and description are required.");
    try {
      const formData = new FormData();
      formData.append("title", portForm.title);
      formData.append("service", portForm.service);
      formData.append("description", portForm.description);
      formData.append("client", portForm.client);
      formData.append("outcome", portForm.outcome);
      if(portMedia) formData.append("media", portMedia);
      await api.addPortfolio(formData);
      setPortForm({title:"",service:"Video Editing",description:"",client:"",outcome:""});
      setPortMedia(null);
      setShowPortForm(false);
      await loadPortfolio();
      showToast("Portfolio item added!");
    } catch (e) {
      showToast(e.message || "Could not add portfolio.");
    }
  };
  const handleServiceClick = (svc) => {
    setActiveService(svc);
    setPage("service");
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const handleNavClick = (navItem) => {
    const map = {
      Services: "services-list",
      Process: "process",
      Pricing: "pricing",
      Portfolio: "portfolio",
      Testimonials: "testimonials",
    };
    setPage(map[navItem] || "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openPortfolioForm = (serviceTitle = "Video Editing") => {
    setPortForm((f) => ({ ...f, service: serviceTitle }));
    setShowPortForm(true);
  };
  if(authLoading){
    return(<><style>{styles}</style><div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Loading...</div></>);
  }
  if(!user){
    return(
      <>
        <style>{styles}</style>
        <LoginPage onLogin={handleLogin}/>
        <Toast msg={toast.msg} show={toast.show}/>
      </>
    );
  }
  const isWorkspace = page==="workspace";
  return(
    <>
      <style>{styles}</style>
      <Toast msg={toast.msg} show={toast.show}/>
      {/* NAV */}
      {!isWorkspace&&(
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}>
              <img src={LOGO_URL} alt="Real Media" className="nav-logo-img"/>
              <span className="nav-logo-text"><span style={{color:"var(--red)"}}>REAL</span> MEDIA</span>
            </div>
            <div className="nav-links">
              {NAV_LINKS.map(l=>(
                <button key={l} className={`nav-link ${NAV_PAGE_MAP[l]?.includes(page)?"active":""}`} onClick={()=>handleNavClick(l)}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {hasProjects && (
                <button className="btn-ghost" style={{padding:"10px 18px",fontSize:".88rem"}} onClick={()=>setPage("workspace")}>
                  {user.role==="team"?"Team Workspace":"My Workspace"}
                </button>
              )}
              <button className="nav-cta" onClick={handleStartProject}>Start Project</button>
              <button onClick={handleLogout} style={{padding:"10px 14px",border:"1px solid var(--line2)",borderRadius:"999px",color:"var(--muted)",fontSize:".82rem",transition:"all .2s"}} title="Logout">⏻</button>
            </div>
          </div>
        </nav>
      )}
      {/* WORKSPACE */}
      {isWorkspace&&(
        <>
          <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,borderBottom:"1px solid var(--line)",background:"rgba(0,0,0,.9)",backdropFilter:"blur(20px)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <img src={LOGO_URL} alt="RM" style={{width:36,height:36}}/>
              <span className="bn" style={{fontSize:"1.2rem",letterSpacing:".2em"}}><span style={{color:"var(--red)"}}>REAL</span> MEDIA</span>
            </div>
            <button className="btn-ghost" style={{padding:"8px 16px",fontSize:".86rem"}} onClick={()=>setPage("home")}>← Back to Site</button>
          </div>
          <div style={{paddingTop:62}}>
            {user.role==="team"
              ? <TeamWorkspace user={user} onToast={showToast} onPortfolioChange={loadPortfolio}/>
              : <ClientWorkspace user={user} onToast={showToast} onShowFeedback={()=>setShowFeedback(true)} onStartProject={()=>setShowForm(true)}/>
            }
          </div>
        </>
      )}
      {/* SERVICES LIST PAGE */}
      {page==="services-list"&&(
        <div className="page">
          <section className="section">
            <div className="section-inner">
              <button className="service-page-back" onClick={()=>setPage("home")}>← Back to Home</button>
              <div className="section-label">OUR SERVICES</div>
              <h1 className="section-title">Everything Your Business Needs to Grow</h1>
              <p className="section-sub">Click on any service to explore our portfolio and start your project.</p>
              <div className="services-grid" style={{marginTop:48}}>
                {SERVICES.map(s=>(
                  <button className="svc-card" key={s.title} onClick={()=>handleServiceClick(s)}>
                    <div className="svc-icon">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span className="svc-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
      {/* SERVICE DETAIL PAGE */}
      {page==="service"&&activeService&&(
        <ServiceDetailPage
          service={activeService}
          onBack={()=>setPage("services-list")}
          onStartProject={handleStartProject}
          portfolioItems={mergePortfolioForService(activeService.title, portfolioItems)}
          isTeam={user.role==="team"}
          onAddPortfolio={()=>openPortfolioForm(activeService.title)}
          onDeletePortfolio={handleDeletePortfolio}
        />
      )}
      {page==="process"&&(
        <div className="page">
          <ProcessSection/>
          <WhyUsSection/>
        </div>
      )}
      {page==="pricing"&&(
        <div className="page">
          <PricingSection onStartProject={handleStartProject}/>
        </div>
      )}
      {page==="portfolio"&&(
        <div className="page">
          <PortfolioSection
            standalone
            onStartProject={handleStartProject}
            portfolioItems={mergeAllPortfolio(portfolioItems)}
            isTeam={user.role==="team"}
            onAddPortfolio={()=>openPortfolioForm("Video Editing")}
            onDeletePortfolio={handleDeletePortfolio}
          />
        </div>
      )}
      {page==="testimonials"&&(
        <div className="page">
          <TestimonialsSection testimonials={testimonials} onAddFeedback={()=>setShowFeedback(true)} user={user}/>
          <CtaBand onStartProject={handleStartProject}/>
        </div>
      )}
      {/* HOME PAGE */}
      {page==="home"&&(
        <div className="page">
          <Hero onStartProject={handleStartProject}/>
          {/* MARQUEE */}
          <div className="marquee">
            <div className="marquee-track">
              {["VIDEO EDITING","WEB DEVELOPMENT","APP DEVELOPMENT","GAME DEVELOPMENT","MARKETING","CONTENT CREATION","BRANDING"].flatMap(w=>[`${w} ·`,`${w} ·`]).map((w,i)=>(
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
          {/* COUNTERS */}
          <section className="section stats-section" style={{padding:"0"}}>
            <div className="stats-grid">
              <StatItem value={50} suffix="+" label="Projects Delivered"/>
              <StatItem value={98} suffix="%" label="Client Retention Rate"/>
              <StatItem value={1} suffix="K" label="Social Followers Generated" onClick={()=>{ setPage("testimonials"); window.scrollTo({top:0,behavior:"smooth"}); }}/>
              <StatItem value={4} suffix=".9★" label="Average Client Rating"/>
            </div>
          </section>
          <ServicesSection onServiceClick={handleServiceClick}/>
          <PortfolioSection onStartProject={handleStartProject} standalone={true} />
          <WhyUsSection/>
          <IndustriesSection/>
          <EstimatorSection/>
          <CtaBand onStartProject={handleStartProject}/>
          <Footer/>
        </div>
      )}
      {/* MODALS */}
      {showForm&&<MultiStepForm onClose={()=>setShowForm(false)} onToast={showToast} user={user} onProjectCreated={()=>{ checkProjects(); setPage("workspace"); }} prefillPlan={prefillPlan}/>}
      {showPortForm&&(
        <div className="msf-backdrop">
          <div className="msf-modal" style={{maxWidth:640}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 className="bn" style={{fontSize:"1.8rem"}}>Add Portfolio</h2>
              <button onClick={()=>setShowPortForm(false)} style={{border:"1px solid var(--line2)",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div className="msf-grid">
              <div className="field"><label>Title *</label><input value={portForm.title} onChange={e=>setPortForm(f=>({...f,title:e.target.value}))} placeholder="Project title"/></div>
              <div className="field"><label>Service</label>
                <select value={portForm.service} onChange={e=>setPortForm(f=>({...f,service:e.target.value}))}>
                  {["Video Editing","Web Development","App Development","Game Development","Marketing"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Description *</label><textarea value={portForm.description} onChange={e=>setPortForm(f=>({...f,description:e.target.value}))} placeholder="What was the project about?"/></div>
            <div className="msf-grid">
              <div className="field"><label>Client</label><input value={portForm.client} onChange={e=>setPortForm(f=>({...f,client:e.target.value}))} placeholder="Client name"/></div>
              <div className="field"><label>Key Outcome</label><input value={portForm.outcome} onChange={e=>setPortForm(f=>({...f,outcome:e.target.value}))} placeholder="e.g. 2x Revenue"/></div>
            </div>
            <div className="field"><label>Upload Media</label>
              <div className="drop-zone" style={{position:"relative"}}>
                <div style={{fontSize:"2rem",marginBottom:8}}>📤</div>
                <div style={{fontSize:".88rem",color:"var(--muted)"}}>Click to upload video or image</div>
                <input type="file" accept="video/*,image/*" style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}} onChange={e=>setPortMedia(e.target.files?.[0]||null)}/>
              </div>
            </div>
            <button className="btn-primary" style={{width:"100%"}} onClick={handleAddPortfolio}>Add to Portfolio ✓</button>
          </div>
        </div>
      )}
      {showFeedback&&(
        <FeedbackForm
          user={user}
          onSubmit={(fb)=>{
            setTestimonials(prev=>[fb,...prev]);
            showToast("Thank you for your feedback! It will appear on our testimonials page.");
          }}
          onClose={()=>setShowFeedback(false)}
        />
      )}
    </>
  );
}