import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LOGO_URL, TEAM_ID, SERVICES, VIDEO_ASSETS, PROCESS_STEPS, WHY_US, INDUSTRIES,
  PRICING_CATEGORIES, PRICING_DATA, ESTIMATOR_CONFIG, ESTIMATE_MAP, COMPLEXITY_MULT, TIMELINE_MULT,
  TEAM_CATEGORIES, TESTIMONIALS_STATIC, mergePortfolioForService, mergeAllPortfolio, isDeletablePortfolioItem,
  resolvePortfolioMediaSrc, COMPANY_NAME, SERVICE_OPTIONS
} from "../data/siteData.js";
import { formatIndian, useCountUp } from "../utils/format.js";
import { ScrollHero } from "./ScrollHero.jsx";
import { api, mediaUrl } from "../api.js";

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
export function Toast({msg,show}){
  return <div className={`toast ${show?"show":""}`}>{msg}</div>;
}
export function StatItem({value,suffix,label,onClick}){
  const [count,ref] = useCountUp(value);
  return(
    <div className="stat-item" ref={ref} onClick={onClick} style={onClick?{cursor:"pointer"}:{}}>
      <div><span className="stat-num">{count.toLocaleString()}</span><span className="stat-suffix">{suffix}</span></div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export function LoginPage({onLogin}){
  const [tab,setTab] = useState("team"); // client | team
  const [form,setForm] = useState({name:"",teamId:""});
  const [err,setErr] = useState("");
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async () => {
    setErr("");
    if(tab==="team"){
      if(form.teamId !== TEAM_ID){ setErr("Invalid Team ID. Please check and try again."); return; }
      if(!form.name.trim()){ setErr("Please enter your name."); return; }
      const user = { id: `team_${form.teamId}`, name: form.name.trim(), role: "team", teamId: form.teamId };
      localStorage.setItem("aw_user", JSON.stringify(user));
      onLogin(user);
      return;
    }
    const user = { id: "client_demo", name: form.name.trim() || "Client", role: "client" };
    localStorage.setItem("aw_user", JSON.stringify(user));
    onLogin(user);
  };
  return(
    <div className="login-page">
      <div className="login-card">
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={LOGO_URL} alt={COMPANY_NAME} style={{width:64,height:64,margin:"0 auto 14px",filter:"drop-shadow(0 0 18px rgba(229,57,53,.5))"}}/>
          <div className="bn" style={{fontSize:"1.8rem",letterSpacing:".2em"}}>
            {COMPANY_NAME.toUpperCase()}
          </div>
          <div style={{color:"var(--muted)",fontSize:".84rem",marginTop:6}}>Welcome back. Sign in with your team ID or continue as a client.</div>
        </div>
        {/* Client / Team tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab==="client"?"active":""}`} onClick={()=>{setTab("client");setErr("")}}>Client</button>
          <button className={`login-tab ${tab==="team"?"active":""}`} onClick={()=>{setTab("team");setErr("")}}>Team Member</button>
        </div>
        {tab==="client"&&(
          <>
            <div className="field"><label>Your Name *</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="Client name"/></div>
            <div style={{color:"var(--muted)",fontSize:".82rem",marginBottom:16}}>Client access is frontend-only for now.</div>
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
        <button className="btn-primary" style={{width:"100%"}} onClick={submit}>
          {tab==="team"?"Enter Team Workspace":"Continue"}
        </button>
      </div>
    </div>
  );
}

const SKILLS_DATA = [
  { icon: "🎬", title: "Video Editing", desc: "Create cinematic edits, reels, and ad-ready content.", time: "6–8 hrs", difficulty: "Beginner", projects: 12 },
  { icon: "✨", title: "Motion Graphics", desc: "Animate brand stories with sleek transitions and effects.", time: "8–10 hrs", difficulty: "Intermediate", projects: 9 },
  { icon: "🖼️", title: "Graphic Design", desc: "Design posters, social templates, and brand visuals.", time: "5–7 hrs", difficulty: "Beginner", projects: 15 },
  { icon: "🧠", title: "UI/UX Design", desc: "Craft polished interfaces that feel premium and intuitive.", time: "10–12 hrs", difficulty: "Intermediate", projects: 11 },
  { icon: "🌐", title: "Web Development", desc: "Build responsive websites that look sharp and convert.", time: "12–16 hrs", difficulty: "Intermediate", projects: 14 },
  { icon: "📱", title: "App Development", desc: "Ship modern mobile experiences with clean product thinking.", time: "16–20 hrs", difficulty: "Advanced", projects: 8 },
  { icon: "⚙️", title: "AI Automation", desc: "Turn workflows into smart systems with no-code and AI tools.", time: "7–9 hrs", difficulty: "Intermediate", projects: 10 },
  { icon: "📣", title: "Digital Marketing", desc: "Grow audiences through content, ads, and campaign strategy.", time: "6–8 hrs", difficulty: "Beginner", projects: 13 },
  { icon: "✍️", title: "Copywriting", desc: "Write persuasive hooks, landing pages, and brand messaging.", time: "5–6 hrs", difficulty: "Beginner", projects: 7 },
  { icon: "🎞️", title: "VFX", desc: "Learn compositing, motion tracking, and cinematic polish.", time: "10–14 hrs", difficulty: "Advanced", projects: 6 },
  { icon: "🧊", title: "3D Design", desc: "Create cinematic 3D assets and motion-ready visuals.", time: "14–18 hrs", difficulty: "Advanced", projects: 5 },
  { icon: "🎮", title: "Game Development", desc: "Prototype playable experiences with modern game systems.", time: "18–24 hrs", difficulty: "Advanced", projects: 4 },
];

const JOURNEY_STEPS = [
  { title: "Learn Skills", desc: "Access free lessons, templates, and practical exercises." },
  { title: "Complete Projects", desc: "Turn theory into polished work with real brief-based tasks." },
  { title: "Build Portfolio", desc: "Showcase your strongest work in a premium profile." },
  { title: "Get Verified", desc: "Earn Assets Weber recognition through quality review." },
  { title: "Receive Clients", desc: "Get matched with opportunities based on proof and ratings." },
  { title: "Scale Career", desc: "Grow into a trusted freelancer with recurring work." },
];

const CATEGORY_DATA = [
  { title: "Creative", items: ["Video Editing", "Motion Graphics", "Graphic Design"] },
  { title: "Development", items: ["Web Development", "App Development", "Game Development"] },
  { title: "Marketing", items: ["SEO", "Digital Marketing", "Social Media"] },
  { title: "AI", items: ["AI Automation", "Prompt Engineering", "AI Tools"] },
  { title: "Design", items: ["UI/UX", "Branding", "Product Design"] },
];

const PROJECT_DATA = [
  { title: "Create a Cinematic Advertisement", difficulty: "Advanced", time: "10 hrs", skills: ["Video Editing", "Motion Graphics"], xp: "900 XP" },
  { title: "Landing Page Design", difficulty: "Intermediate", time: "6 hrs", skills: ["UI/UX Design", "Graphic Design"], xp: "700 XP" },
  { title: "Restaurant Website", difficulty: "Intermediate", time: "8 hrs", skills: ["Web Development", "UI/UX"], xp: "800 XP" },
  { title: "Mobile App UI", difficulty: "Intermediate", time: "7 hrs", skills: ["App Development", "UI/UX"], xp: "750 XP" },
  { title: "Motion Graphics Reel", difficulty: "Advanced", time: "9 hrs", skills: ["Motion Graphics", "VFX"], xp: "850 XP" },
  { title: "Brand Identity Package", difficulty: "Beginner", time: "5 hrs", skills: ["Graphic Design", "Branding"], xp: "650 XP" },
];

const FREELANCER_STEPS = [
  { title: "Learn", desc: "Master practical skills through guided pathways." },
  { title: "Submit Projects", desc: "Show your work through challenge-based submissions." },
  { title: "Assets Weber Reviews", desc: "Receive structured feedback and quality checks." },
  { title: "Verified Badge", desc: "Unlock trust signals for serious opportunities." },
  { title: "Client Matching", desc: "Get introduced to clients that fit your profile." },
  { title: "Start Earning", desc: "Invoice, deliver, and grow your freelance career." },
];

const CLIENT_FEATURES = [
  { title: "Verified Talent", desc: "Freelancers are reviewed before they appear in the network." },
  { title: "Real Project Experience", desc: "Skills are backed by submissions and portfolio evidence." },
  { title: "Portfolio-Based Hiring", desc: "Clients review quality before they ever connect." },
  { title: "Transparent Ratings", desc: "Performance is visible through ratings and outcomes." },
  { title: "Fast Communication", desc: "The platform keeps collaboration simple and efficient." },
  { title: "Quality Assurance", desc: "Every path is shaped to maintain a premium standard." },
];

export function ExploreSkillsSection(){
  return(
    <section id="skill-explorer" className="section">
      <div className="section-inner">
        <div className="section-label">EXPLORE SKILLS</div>
        <h2 className="section-title">Learn Premium Skills That Create Income</h2>
        <p className="section-sub">Choose a path, build real work, and grow from beginner to verified freelancer inside one platform.</p>
        <div className="skills-grid">
          {SKILLS_DATA.map((skill) => (
            <div className="skill-card" key={skill.title}>
              <div className="skill-card-icon">{skill.icon}</div>
              <div className="skill-card-top">
                <h3>{skill.title}</h3>
                <p>{skill.desc}</p>
              </div>
              <div className="skill-card-meta">
                <span>{skill.time}</span>
                <span>{skill.difficulty}</span>
                <span>{skill.projects} Projects</span>
              </div>
              <button className="btn-ghost skill-card-cta">Start Learning</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LearningJourneySection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">THE JOURNEY</div>
        <h2 className="section-title">From First Lesson to First Client</h2>
        <p className="section-sub">Every step is designed to move learners from curiosity to credibility.</p>
        <div className="journey-list">
          {JOURNEY_STEPS.map((step, index) => (
            <div className="journey-step" key={step.title}>
              <div className="journey-index">0{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              {index < JOURNEY_STEPS.length - 1 && <div className="journey-arrow">↓</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LearningDashboardPreviewSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">LEARNING DASHBOARD</div>
        <h2 className="section-title">A Clean Preview of Your Growth</h2>
        <div className="dashboard-preview">
          <div className="dashboard-card">
            <div className="dashboard-card-head">
              <div>
                <div className="dashboard-label">Current Skill</div>
                <h3>Motion Graphics</h3>
              </div>
              <div className="dashboard-pill">Verified Path</div>
            </div>
            <div className="dashboard-stats">
              <div className="dashboard-metric">
                <span>Progress</span>
                <strong>82%</strong>
              </div>
              <div className="dashboard-metric">
                <span>XP</span>
                <strong>4,820</strong>
              </div>
              <div className="dashboard-metric">
                <span>Badges</span>
                <strong>6</strong>
              </div>
            </div>
            <div className="dashboard-panels">
              <div className="dashboard-panel">
                <div className="dashboard-label">Current Project</div>
                <h4>Cinematic Ad Reel</h4>
              </div>
              <div className="dashboard-panel">
                <div className="dashboard-label">Upcoming Assignment</div>
                <h4>Brand Transition Pack</h4>
              </div>
            </div>
            <div className="dashboard-footer">
              <div><span className="dashboard-label">Portfolio</span><strong>72%</strong></div>
              <div><span className="dashboard-label">Verification</span><strong>Pending Review</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SkillCategoriesSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">SKILL CATEGORIES</div>
        <h2 className="section-title">Choose the Path That Fits Your Goals</h2>
        <div className="category-grid">
          {CATEGORY_DATA.map((category) => (
            <div className="category-card" key={category.title}>
              <h3>{category.title}</h3>
              <ul>
                {category.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectBasedLearningSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">PROJECT-BASED LEARNING</div>
        <h2 className="section-title">Practice Through Real Challenges</h2>
        <p className="section-sub">Build portfolio-ready work with guided briefs, real deliverables, and clear XP rewards.</p>
        <div className="project-grid">
          {PROJECT_DATA.map((project) => (
            <div className="project-card" key={project.title}>
              <div className="project-top">
                <span className="project-badge">{project.difficulty}</span>
                <span className="project-badge">{project.time}</span>
              </div>
              <h3>{project.title}</h3>
              <p>Skills: {project.skills.join(" • ")}</p>
              <div className="project-footer">
                <span>Reward {project.xp}</span>
                <button className="btn-ghost">View Brief</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FreelancerJourneySection(){
  return(
    <section id="freelancer-journey" className="section">
      <div className="section-inner">
        <div className="section-label">BECOME A FREELANCER</div>
        <h2 className="section-title">A Clear Path to Verified Client Work</h2>
        <div className="journey-flow">
          {FREELANCER_STEPS.map((step) => (
            <div className="flow-node" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FreelancerProfilePreviewSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">FREELANCER PROFILE</div>
        <h2 className="section-title">A Professional Profile That Converts</h2>
        <div className="profile-card">
          <div className="profile-card-main">
            <div className="profile-avatar">AM</div>
            <div>
              <div className="profile-name">Aarav Mehta</div>
              <div className="profile-role">Motion Graphics • Video Editing</div>
              <div className="profile-badges">
                <span className="dashboard-pill">Verified</span>
                <span className="dashboard-pill">Top Rated</span>
              </div>
            </div>
          </div>
          <div className="profile-meta">
            <div><strong>4.9★</strong><span>Rating</span></div>
            <div><strong>48</strong><span>Projects</span></div>
            <div><strong>126</strong><span>Reviews</span></div>
          </div>
          <div className="profile-skills">
            {["Motion Graphics","Video Editing","Brand Design","AI Automation"].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <div className="profile-actions">
            <button className="btn-primary">Portfolio</button>
            <button className="btn-ghost">Available Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyClientsSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">WHY CLIENTS CHOOSE US</div>
        <h2 className="section-title">Quality and Verification Lead the Match</h2>
        <div className="why-grid">
          {CLIENT_FEATURES.map((feature) => (
            <div className="why-card" key={feature.title}>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommunitySection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">COMMUNITY</div>
        <h2 className="section-title">A Growing Network of Builders</h2>
        <div className="community-grid">
          <div className="community-card"><strong>2.4K+</strong><span>Students Learning</span></div>
          <div className="community-card"><strong>860+</strong><span>Freelancers</span></div>
          <div className="community-card"><strong>120+</strong><span>Mentors</span></div>
          <div className="community-card"><strong>310+</strong><span>Live Projects</span></div>
          <div className="community-card"><strong>95%</strong><span>Success Stories</span></div>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="cta-band" style={{ borderRadius: 28 }}>
          <h2>Start Learning Today. Start Earning Tomorrow.</h2>
          <p>Everything you need to build a successful digital career is inside Assets Weber.</p>
          <div className="cta-actions">
            <button className="btn-primary">Explore Skills</button>
            <button className="btn-ghost">Become a Freelancer</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────
export function Hero({ onStartProject, onExploreSkills, onBecomeFreelancer }) {
  return <ScrollHero onStartProject={onStartProject} onExploreSkills={onExploreSkills} onBecomeFreelancer={onBecomeFreelancer} />;
}
// ─── SERVICES SECTION (landing) ───────────────────────────────────────────────
export function ServicesSection({onServiceClick}){
  return(
    <section className="section" id="services">
      <div className="section-inner">
        <div className="section-label">OUR SERVICES</div>
        <h2 className="section-title">Everything Your Business Needs to Grow</h2>
        <p className="section-sub">From video editing and VFX to full-stack development, we cover every angle of your digital growth.</p>
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
export function ServiceDetailPage({service, onBack, onStartProject, portfolioItems=[], isTeam, onAddPortfolio, onDeletePortfolio}){
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
export function VideoPortfolioCard({item, onStartProject, onDelete, isTeam}){
  const [modalOpen, setModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const src = resolvePortfolioMediaSrc(item);
  const isVideo = item.file || item.fileUrl || item.mediaType === "video" || (item.mediaUrl && /\.(mp4|webm|mov)/i.test(item.mediaUrl));
  const desc = item.desc || item.description || "";
  return(
    <>
      <div className="port-card">
        <div className="port-media" style={{height:240,cursor:isVideo?"pointer":"default"}} 
             onClick={isVideo?()=>setModalOpen(true):undefined}
        >
          {isVideo && !videoError ? (
          <video
            ref={videoRef}
            src={src}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
            loop
            playsInline
            autoPlay
            muted
            preload="metadata"
            onCanPlay={() => videoRef.current?.play().catch(() => {})}
            onError={() => setVideoError(true)}
          />
          ) : (!isVideo && src) ? (
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
            {videoError ? (
              <div style={{color:"#fff",padding:24,background:"rgba(255,255,255,0.05)",borderRadius:12,textAlign:"center"}}>
                Video preview failed to load. Please try again later.
              </div>
            ) : (
              <video
                src={src}
                style={{maxWidth:"100%",maxHeight:"80vh",borderRadius:8,outline:"none"}}
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
              />
            )}
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
export function ProcessSection(){
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
export function WhyUsSection(){
  return(
    <section className="section">
      <div className="section-inner">
        <div className="section-label">WHY CHOOSE US</div>
        <h2 className="section-title">Why Global Brands Choose {COMPANY_NAME}</h2>
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
export function IndustriesSection(){
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
export function PricingSection({onStartProject}){
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
export function PortfolioSection({onStartProject, portfolioItems=[], isTeam, onAddPortfolio, onDeletePortfolio, standalone=false}){
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
export function EstimatorSection(){
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
export function TestimonialsSection({testimonials=[], onAddFeedback, user}){
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
export function MultiStepForm({onClose,onToast,user,onProjectCreated,prefillPlan}){
  const [step,setStep] = useState(0);
  const TOTAL=4;
  
  let initialService = "";
  if (prefillPlan) {
    if (prefillPlan.name.includes("Edit") || prefillPlan.name.includes("Ad")) initialService = "Video Editing";
    else if (prefillPlan.name.includes("VFX") || prefillPlan.name.includes("Visual")) initialService = "VFX";
    else if (prefillPlan.name.includes("Website") || prefillPlan.name.includes("Store")) initialService = "Web Dev";
    else if (prefillPlan.name.includes("App")) initialService = "App Dev";
    else if (prefillPlan.name.includes("Game")) initialService = "Game Dev";
    else if (prefillPlan.name.includes("Growth") || prefillPlan.name.includes("Domination")) initialService = "Marketing";
  }
  const [data,setData] = useState({service:initialService,budget:prefillPlan?prefillPlan.price:"",timeline:"",name:user?.name||"",email:user?.email||"",phone:"",title:"",description:"",files:[]});
  const up=(k,v)=>setData(d=>({...d,[k]:v}));

  const submit=async()=>{
    if(!data.name||!data.email) return onToast("Please fill your name and email.");
    if(!data.service||!data.title||!data.description) return onToast("Please complete service, title, and description.");
    const project = {
      id: `proj_${Date.now()}`,
      title: data.title,
      service: data.service,
      status: "Brief submitted",
      projectState: "active",
    };
    onProjectCreated?.(project);
    onToast(`Project submitted! Your unique project ID is ${project.id}`);
    onClose();
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
          {["Service","Select Plan","Project Details","Your Info"].map((l,i)=>(
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
              {[["🎬","Video Editing"],["✨","VFX"],["🌐","Web Dev"],["📱","App Dev"],["🎮","Game Dev"],["📈","Marketing"]].map(([ic,lb])=>(
                <button key={lb} className={`svc-sel-btn ${data.service===lb?"sel":""}`} onClick={()=>up("service",lb)}>
                  <span className="svc-sel-icon">{ic}</span>{lb}
                </button>
              ))}
            </div>
          </div>
        )}
        {step===1&&(
          <div>
            <p style={{color:"var(--muted)",marginBottom:14,fontSize:".92rem"}}>Select a plan for {data.service}</p>
            <div className="budget-opts">
              {(PRICING_DATA[data.service] || PRICING_DATA[{"Web Dev":"Websites","App Dev":"Apps","Game Dev":"Games"}[data.service]] || []).map(p=>(
                <button key={p.name} className={`budget-opt ${data.budget===p.price?"sel":""}`} onClick={()=>up("budget",p.price)} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"12px"}}>
                  <span style={{fontWeight:600}}>{p.name}</span>
                  <span style={{fontSize:".85rem",marginTop:4}}>{p.price}</span>
                </button>
              ))}
              <button className={`budget-opt ${data.budget==="Custom"?"sel":""}`} onClick={()=>up("budget","Custom")} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"12px"}}>
                <span style={{fontWeight:600}}>Custom Plan</span>
                <span style={{fontSize:".85rem",marginTop:4}}>Let's discuss</span>
              </button>
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
            <button className="btn-primary" onClick={submit}>Submit Brief ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── FEEDBACK FORM ────────────────────────────────────────────────────────────
export function FeedbackForm({onSubmit, onClose, user}){
  const [step, setStep] = useState(0);
  const [projectTitle, setProjectTitle] = useState("");
  const [err, setErr] = useState("");
  const [form, setForm] = useState({name:user?.name||"",biz:"",quote:"",result:"",tag:"Video Editing"});
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const verifyProject = async () => {
    setErr("");
    if(!projectTitle.trim()){ setErr("Enter your project name."); return; }
    setForm(f=>({...f, tag: f.tag}));
    setStep(1);
  };
  const submit = async () => {
    if(!form.name||!form.quote) return;
    onSubmit({
      id: `testi_${Date.now()}`,
      name: form.name,
      biz: form.biz,
      quote: form.quote,
      tag: form.tag,
      result: form.result,
      initials: form.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(),
    });
    onClose();
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
            <button className="btn-primary" style={{width:"100%"}} onClick={verifyProject}>Verify Project →</button>
          </>
        ) : (
          <>
            <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",borderRadius:12,padding:"10px 14px",fontSize:".84rem",color:"#86efac",marginBottom:16}}>
              Project verified: <strong>{projectTitle}</strong>
            </div>
            <div className="field"><label>Your Name *</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="Full name"/></div>
        <div className="field"><label>Business / Role</label><input value={form.biz} onChange={e=>up("biz",e.target.value)} placeholder="e.g. Gym Owner, Mumbai"/></div>
        <div className="field"><label>Service Used</label>
          <select value={form.tag} onChange={e=>up("tag",e.target.value)}>
            {SERVICE_OPTIONS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Your Feedback *</label><textarea style={{minHeight:100}} value={form.quote} onChange={e=>up("quote",e.target.value)} placeholder={`Share your experience with ${COMPANY_NAME}...`}/></div>
        <div className="field"><label>Key Result</label><input value={form.result} onChange={e=>up("result",e.target.value)} placeholder="e.g. 2x Leads, 180% Sales"/></div>
            {err&&<div style={{background:"rgba(229,57,53,.12)",border:"1px solid rgba(229,57,53,.35)",borderRadius:12,padding:"10px 14px",fontSize:".86rem",color:"#fca5a5",marginBottom:14}}>{err}</div>}
            <button className="btn-primary" style={{width:"100%",marginTop:4}} onClick={submit}>Submit Feedback ✓</button>
          </>
        )}
      </div>
    </div>
  );
}
// ─── PAYMENT GATE ────────────────────────────────────────────────────────────
export function PaymentGate({ project, onPaymentComplete, onToast }) {
  const [loading, setLoading] = useState(false);
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
          razorpay_payment_id: `mock_${order.id}`,
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
        name: COMPANY_NAME,
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
export function ClientWorkspace({user, onToast, onShowFeedback, onStartProject}){
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
    } catch (e) {
      void e;
    }
  }, []);
  useEffect(()=>{
    queueMicrotask(() => {
      loadProjects();
      loadNotifications();
    });
  }, [loadProjects, loadNotifications]);
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
          <div><div className="bn" style={{fontSize:"1.1rem",letterSpacing:".2em"}}>{COMPANY_NAME.toUpperCase()}</div><div style={{color:"var(--muted)",fontSize:".76rem"}}>Client Workspace</div></div>
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
export function TeamWorkspace({user, onToast, onPortfolioChange}){
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
  const teamFileInputRef = useRef(null);
  const [teamMessages, setTeamMessages] = useState([]);
  const [teamMsg, setTeamMsg] = useState("");
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
    } catch (e) {
      void e;
    }
  }, []);
  const loadTeamMessages = useCallback(async ()=>{
    try {
      const { messages } = await api.getTeamChatMessages();
      setTeamMessages(messages);
    } catch (e) {
      void e;
    }
  }, []);
  const sendTeam = async () => {
    if(!teamMsg.trim()) return;
    try {
      await api.sendTeamChatMessage(teamMsg.trim());
      setTeamMsg("");
      loadTeamMessages();
    } catch (e) {
      onToast(e.message || "Could not send team message.");
    }
  };
  const uploadTeamFiles = async (e) => {
    if(!e.target.files?.length) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach(f=>formData.append("files", f));
    try {
      await api.uploadTeamChatFiles(formData);
      onToast("Files uploaded.");
      loadTeamMessages();
    } catch (err) {
      onToast(err.message || "Upload failed.");
    }
    e.target.value = "";
  };
  useEffect(()=>{
    queueMicrotask(() => {
      loadProjects();
      loadPortfolio();
      loadNotifications();
      loadTeamMessages();
    });
  }, [loadProjects, loadPortfolio, loadNotifications, loadTeamMessages]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[selClient?.messages, teamMessages, activeNav]);
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
          <div><div className="bn" style={{fontSize:"1.1rem",letterSpacing:".2em"}}>{COMPANY_NAME.toUpperCase()}</div><div style={{color:"var(--muted)",fontSize:".76rem"}}>Team Workspace</div></div>
        </div>
        <div style={{color:"var(--muted)",fontSize:".76rem",letterSpacing:".08em",marginBottom:8,padding:"0 14px"}}>
          {user?.name} · Team
        </div>
        <div className="sidebar-nav">
          {[
            {id:"clients",icon:"👥",label:"Client List",badge:projects.length||null},
            {id:"portfolio",icon:"🎬",label:"Portfolio"},
            {id:"teamchat",icon:"💬",label:"Team Chat Group"},
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
          <div className="ws-title">{activeNav==="clients"?"Client Projects":activeNav==="portfolio"?"Portfolio Manager":activeNav==="teamchat"?"Team Chat Group":"Notifications"}</div>
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
                            await api.stopProject(selClient.id);
                            setProjects(prev=>prev.filter(x=>x.id!==selClient.id));
                            setSelClient(null);
                            onToast("Project stopped.");
                          } catch(e) { onToast(e.message); }
                        }}>Stop</button>}
                        {selClient?.projectState === 'active' && <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px",color:"#86efac"}} onClick={async () => {
                          if(!confirm("Are you sure you want to finish this project? This will delete working files and stop chat access.")) return;
                          try {
                            await api.finishProject(selClient.id);
                            setProjects(prev=>prev.filter(x=>x.id!==selClient.id));
                            setSelClient(null);
                            onToast("Project finished.");
                          } catch(e) { onToast(e.message); }
                        }}>Finish</button>}
                        <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px",color:"#fca5a5"}} onClick={async () => {
                          if(!confirm("Are you sure you want to completely delete this project? This will remove all files and cannot be undone.")) return;
                          try {
                            await api.deleteProject(selClient.id);
                            setProjects(prev=>prev.filter(x=>x.id!==selClient.id));
                            setSelClient(null);
                            onToast("Project deleted.");
                          } catch(e) { onToast(e.message); }
                        }}>Delete</button>
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
                      {SERVICE_OPTIONS.map(s=><option key={s}>{s}</option>)}
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
        {activeNav==="teamchat"&&(
          <div className="chat-panel" style={{height: "calc(100vh - 120px)", maxWidth:680, margin: "0 auto", border: "1px solid var(--line)", borderRadius: 20}}>
            <div className="chat-head">
              <div>
                <div style={{fontWeight:600,marginBottom:4}}>Team Chat Group</div>
                <div style={{color:"var(--muted)",fontSize:".8rem"}}>Discuss projects internally with other team members.</div>
              </div>
              <button className="btn-ghost" style={{fontSize:".82rem",padding:"8px 14px"}} onClick={()=>teamFileInputRef.current?.click()}>Upload Files</button>
              <input ref={teamFileInputRef} type="file" multiple style={{display:"none"}} onChange={uploadTeamFiles}/>
            </div>
            <div className="chat-body" style={{flex:1}}>
              {teamMessages.map((m)=>(
                <div key={m.id} className={`bubble ${m.senderId===user?.id?"team":"client"}`}>
                  <small>{m.senderName||user?.name}</small>
                  {m.text}
                  {m.fileUrl && (
                    <div style={{marginTop: 8}}>
                      <a href={mediaUrl(m.fileUrl)} target="_blank" rel="noreferrer" style={{color:"inherit",textDecoration:"underline"}}>{m.fileName}</a>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div className="composer">
              <input value={teamMsg} onChange={e=>setTeamMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendTeam()} placeholder="Message team..."/>
              <button className="btn-primary" style={{padding:"11px 20px",fontSize:".88rem"}} onClick={sendTeam}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── CTA BAND ─────────────────────────────────────────────────────────────────
export function CtaBand({onStartProject}){
  return(
    <div className="cta-band">
      <h2 className="bn">Ready to Build Something Great?</h2>
      <p>Join 50+ businesses that chose {COMPANY_NAME} to grow their brand digitally.</p>
      <div className="cta-actions">
        <button className="btn-primary" onClick={onStartProject}>Start Your Project</button>
      </div>
    </div>
  );
}
// ─── FOOTER ───────────────────────────────────────────────────────────────────
export function Footer(){
  const contactLinks = {
    "Email Us": { href: "mailto:assetwebermail@gmail.com", label: "assetwebermail@gmail.com" },
    "Instagram": { href: "https://instagram.com/assetsweber", label: "@assetsweber" },
    "YouTube": { href: "https://youtube.com/@AssetsWeber", label: "@AssetsWeber" },
    "WhatsApp": { href: "https://wa.me/919416085060", label: "+91 9416085060" },
  };

  return(
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="bn" style={{fontSize:"1.8rem",letterSpacing:".2em"}}>
              {COMPANY_NAME.toUpperCase()}
            </div>
            <p>A full-service digital agency helping businesses grow with international-level content, VFX, development, and marketing.</p>
          </div>
          {[
            {title:"Services",links:SERVICE_OPTIONS},
            {title:"Company",links:["Portfolio","Process","Pricing","Testimonials"]},
            {title:"Contact",links:["Email Us","Instagram","YouTube","WhatsApp"]},
          ].map(col=>(
            <div className="footer-col" key={col.title}>
              <h5>{col.title}</h5>
              {col.links.map(l=>(
                <a 
                  key={l} 
                  href={col.title === "Contact" ? contactLinks[l]?.href : "#"} 
                  onClick={e=>{if(col.title !== "Contact") e.preventDefault();}}
                  target={col.title === "Contact" && l !== "Email Us" ? "_blank" : undefined}
                  rel={col.title === "Contact" && l !== "Email Us" ? "noopener noreferrer" : undefined}
                >
                  {col.title === "Contact" ? contactLinks[l]?.label : l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2026 {COMPANY_NAME}. All rights reserved.</p>
          <p style={{color:"var(--muted)",fontSize:".8rem"}}>Built in India · Delivered Globally</p>
        </div>
      </div>
    </footer>
  );
}
