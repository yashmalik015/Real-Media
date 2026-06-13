export const styles = `
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
/* ── SCROLL HERO (3D frame sequence) ── */
.scroll-hero-section{height:calc(100vh - 81px + 80vh);position:relative}
.scroll-hero-sticky{position:sticky;top:81px;height:calc(100vh - 81px);overflow:hidden;background:#020202;z-index:2}
.scroll-hero-sticky--done .scroll-hero-hint{opacity:0!important}
.scroll-hero-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.scroll-hero-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 6% 18%,rgba(229,57,53,.18) 0%,transparent 38%),radial-gradient(ellipse at 88% 52%,rgba(229,57,53,.1) 0%,transparent 32%),linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.25) 40%,rgba(0,0,0,.65) 100%);pointer-events:none;z-index:1}
.scroll-hero-overlay{position:relative;z-index:2;min-height:100%;display:grid;align-items:center;pointer-events:auto}
.scroll-hero-overlay.hero-inner{animation:none}
.scroll-hero-left{position:relative;z-index:2}
.scroll-hero-card-3d{opacity:0;transform:translateX(48px) scale(0.9) rotateY(-12deg);transform-style:preserve-3d;will-change:transform,opacity;transition:none}
.scroll-hero-fc{opacity:0;transform:translateY(56px) scale(0.86) rotateX(18deg);transform-style:preserve-3d;will-change:transform,opacity;transition:none;backface-visibility:hidden}
.scroll-hero-overlay .hero-card{animation:none;perspective:900px}
.scroll-hero-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);z-index:4;display:flex;flex-direction:column;align-items:center;gap:10px;color:rgba(255,255,255,.45);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;animation:scrollHintPulse 2.4s ease-in-out infinite;transition:opacity .3s ease}
.scroll-hero-hint-line{width:1px;height:36px;background:linear-gradient(to bottom,rgba(229,57,53,.8),transparent)}
@keyframes scrollHintPulse{0%,100%{opacity:.45;transform:translateX(-50%) translateY(0)}50%{opacity:.85;transform:translateX(-50%) translateY(6px)}}
.scroll-hero-loader{position:fixed;inset:0;z-index:200;background:#020202;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease,visibility .5s ease}
.scroll-hero-loader--fade{opacity:0;visibility:hidden;pointer-events:none}
.scroll-hero-loader-inner{text-align:center;padding:32px;max-width:360px;width:100%}
.scroll-hero-loader-logo{width:72px;height:72px;object-fit:contain;margin:0 auto 28px;filter:drop-shadow(0 0 18px rgba(229,57,53,.5))}
.scroll-hero-loader-bar{height:3px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-bottom:14px}
.scroll-hero-loader-fill{height:100%;background:var(--red);border-radius:99px;transition:width .2s ease}
.scroll-hero-loader-text{color:var(--muted);font-size:.84rem}
@media (max-width:1024px){.scroll-hero-section{height:calc(100vh - 81px + 65vh)}}
@media (max-width:768px){
  .scroll-hero-section{height:calc(100vh - 81px + 55vh)}
}
/* ── MARQUEE ── */
.marquee{background:#df3c38;padding:16px 0;overflow:hidden;margin-top:-40vh;position:relative;z-index:10}
@media (max-width:1024px){.marquee{margin-top:-25vh}}
@media (max-width:768px){.marquee{margin-top:-15vh}}
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
